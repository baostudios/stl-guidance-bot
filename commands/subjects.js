const { SlashCommandBuilder } = require("discord.js");
const { Course } = require("../assets/data/courses");
const { GuidanceEmbed } = require("../assets/utils/embeds");

const courseHandler = new Course();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("subjects")
        .setDescription("Get all the subjects. All of them! ALL. OF. THEM. " +
            "(I ran out of ideas for this description)")
        .addStringOption(option =>
            option.setName('subject')
                .setDescription('The subject of the course you want to add. ' +
                    'For a list of courses, run /subjects')
                .setRequired(false)
                .addChoices(... courseHandler.courseSubjectOptionsFormatted())),
    async execute(interaction) {
        const subject = interaction.options.getString('subject');

        let query;
        await interaction.client.db.execute(
            "users", "timetable", async collection => {
                query = await collection.findOne({ _id: interaction.user.id });
            },
        );

        const registeredCourses = Object.values(query).slice(1).flat();

        // the point of this is to make the embed nicer because code blocks look strange
        // const newLineIndex = {
        //     0: 2,
        //     1: 0,
        //     2: 7,
        //     3: 1,
        //     4: 0,
        // };

        if (!subject) {
            const subjectEmbed = new GuidanceEmbed()
                .setTitle("All Subjects")
                .setDescription("\`\`\`md\n> Subjects like this are not in your timetable.\n" +
                    "< Subjects like this are part of your timetable.\n\n" +
                    "Here you'll find a list of all the subjects that the courses " +
                    "offered at STL will fall under.\`\`\`")
                .setFooter({
                    text: "Note that core academic courses are not offered because" +
                        "I'm too lazy to put them in, so if you want them, you'll have to give me the data yourself! " +
                        "Sorry about that.",
                });

            courseHandler.courseSubjectOptions().sort((a, b) =>
                a.name.localeCompare(b.name)).forEach(
                (_subject, i) => {
                    const courses = courseHandler.getCourseLabels(_subject['value']).map(
                        course => (registeredCourses.includes(course) ? '< ' : '> ')
                            + course + ` : [ ${courseHandler.periods(course)} ][ ${courseHandler.getCodes(course)} ]`,
                    );

                    // if ((i + 1) % 3 === 0) {
                    //     return subjectEmbed.addFields(
                    //         {
                    //             name: '\u200b',
                    //             value: '\u200b',
                    //             inline: true,
                    //         },
                    //     );
                    // }
                    subjectEmbed.addFields(
                        {
                            name: _subject['name'],
                            value: `\`\`\`md\n${courses.join('\n')}\`\`\``,
                                // `${'\n\u200b'.repeat(newLineIndex[i])}\`\`\``,
                            inline: false,
                        },
                    );
                    // i++;
                },
            );
            interaction.reply({ embeds: [ subjectEmbed ] });
        } else {
            const desc = [];
            courseHandler.getCoursesByName(subject).forEach(
                course => {
                    const _courseDescription = course['description'].split('/');
                    const _displayDescription = _courseDescription[0].trim() +
                        ' '.repeat(9 - _courseDescription[0].trim().length);
                    desc.push(`${registeredCourses.includes(course['label']) ? '< ' :
                            '> '} ${course['label']} : [ ${_displayDescription} ]` +
                        `[ ${_courseDescription.slice(1).join(' / ').trim()} ]`);
                },
            );

            const subjectEmbed = new GuidanceEmbed()
                .setTitle(courseHandler.formatSubjectTitle(subject) + ' Courses')
                .setDescription(`\`\`\`md\n> Subjects like this are not in your timetable.\n` +
                    `< Subjects like this are part of your timetable.\`\`\`\`\`\`md\n${desc.join('\n')}\`\`\``)
                .setFooter({
                    text: "Note that core academic courses are not offered because" +
                        "I'm too lazy to put them in, so if you want them, you'll have to give me the data yourself! " +
                        "Sorry about that.",
                });
            interaction.reply({ embeds: [ subjectEmbed ] });
        }
    },
};