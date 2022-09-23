const {
    SelectMenuBuilder,
    ActionRowBuilder,
    ComponentType,
    Guild,
    TextChannel,
    ButtonBuilder,
    ButtonStyle, SlashCommandBuilder,
} = require("discord.js");
const { ErrorEmbed, GuidanceEmbed, SuccessEmbed } = require("../assets/utils/embeds");
const { Course } = require("../assets/data/courses");
const gradient = require("../assets/utils/gradient");
const createPaginator = require("../handlers/paginator");

const fetch = require("node-fetch");
const courseHandler = new Course();

// iterate through the keys of every single course (ap, religion, electives) then capitalize
// the first letter of every word (except for and which uses ' a' for some reason)

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timetable")
        .setDescription("Add your courses to your timetable")
        .addSubcommand(subcommand =>
            subcommand
                .setName('init')
                .setDescription("Only use this for your first time!"))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Replace your timetable courses')
                // this part is disgusting
                // really wished I could loop through the options
                // but d.js has a seizure whenever I do that
                .addStringOption(option =>
                    option.setName('subject')
                        .setDescription('The subject of the course you want to add. ' +
                            'For a list of courses, run /subjects')
                        .setRequired(true)
                        .addChoices(... courseHandler.courseSubjectOptionsFormatted()))
                .addStringOption(option =>
                    option.setName('course')
                        .setDescription('The course you want to add to your timetable')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Remove a course from your timetable')
                .addIntegerOption(option =>
                    option.setName('period')
                        .setDescription('To see the period of the course you want to remove, run ' +
                            '/profile and see which course matches up.')
                        .setRequired(true)
                        .addChoices(
                            { name: "Period 1", value: 1 }, { name: "Period 2", value: 2 },
                            { name: "Period 3", value: 3 }, { name: "Period 4", value: 4 },
                        ),
                ),
        ),
    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        let isRegistered;
        await interaction.client.db.execute(
            "users", "userinfo", async collection => {
                isRegistered = await collection.findOne({ _id: interaction.user.id });

            },
        );
        if (!isRegistered) {
            const embed = new ErrorEmbed()
                .setDescription(`
                    You're not registered yet! ` +
                    `Create an account using \`/register\``);

            return interaction.reply({ embeds: [ embed ] });
        }

        const subCommand = interaction.options.getSubcommand();
        if (subCommand === 'init' || !subCommand) {
            await interaction.client.db.execute(
                "users", "timetable", async collection => {
                    isRegistered = await collection.findOne({ _id: interaction.user.id });

                },
            );
            if (isRegistered) {
                const embed = new ErrorEmbed()
                    .setDescription(`
                    You're already registered! ` +
                        `Something wrong in your timetable? Try \`/timetable add\``);

                return interaction.reply({ embeds: [ embed ] });
            }

            const pages = [
                new GuidanceEmbed()
                    .setTitle("Adding Your Courses")
                    .setDescription("Hey there! Below you will find a list of course codes that represent your four (or " +
                        "five) classes for the rest of semester 1! To choose a class, simply find the course code for the" +
                        " class that you attend and click it in the select menu!\nTo see the list of current list of " +
                        "classes, click the buttons to navigate through the pages.")
                    .setColor(gradient()),
            ];

            const _courses = courseHandler.courses;
            const row = [];

            // using the getCourses() method and getting the entries we can run a forEach loop to extract all
            // the course information and create a new SelectMenuBuilder
            Object.entries(_courses).forEach(
                (t => {
                    const menuTitle = courseHandler.formatSubjectTitle(t[0]) + ' Courses';
                    const _codes = courseHandler.codes;
                    // courses for course label
                    const c = courseHandler.getCoursesByName(t[0]);
                    const menu = new ActionRowBuilder().addComponents(
                        new SelectMenuBuilder()
                            .setCustomId(`courseSelectId${t[0]}`)
                            .setPlaceholder(`${menuTitle} (e.g. ${c[0].label})`)
                            .setMinValues(t[0] === 'ap' ? 2 : 1)
                            .setMaxValues(t[0] === 'ap' ? 2 : 1)  // if course id is ap then have a max value of 2
                            // instead of 1
                            .addOptions(c));
                    row.push(menu);

                    const e = new GuidanceEmbed()
                        // ternary operator to determine whether course is aP or otherwise
                        // split the key using underscores then join it together using places
                        // don't capitalize if the string is `and`
                        // regex to capitalize the first letter of every word in a string
                        .setTitle(menuTitle)
                        .setColor(gradient())
                        .setThumbnail("https://cdn.discordapp.com/attachments/1018302806085611600/" +
                            "1020148918677426196/stl_transparent.png");
                    // iterate over the items in each course and add a new field to the course embed
                    c.forEach(_c => {
                        let code;
                        switch (_c["label"].slice(0, 3)) {
                            case 'HRE':
                                code = _c["label"].slice(0, 6);
                                break;
                            case 'PPL':
                                code = _c["label"].slice(0, 3) + _c["label"][5];
                                break;
                            default:
                                code = _c["label"].slice(0, 3);
                        }
                        _codes[code].push({ course: _c["label"], desc: _c["description"] });
                    });
                    Object.entries(_codes).forEach(
                        // loop for the subjects for each course
                        // then loop through every single class in each course
                        course => {
                            if (courseHandler.subjectCodes[course[0]] === t[0]) {
                                let _value = [];
                                course[1].forEach(
                                    i => {
                                        const _d = i["desc"].split('/');
                                        _value.push(
                                            `\`${i["course"]}\` - ${_d[0].trim()}  /  ${_d.slice(1).join("  /  ")}`);
                                    },
                                );
                                // add the field
                                e.addFields({
                                    name: courseHandler.codeId[course[0]], value: _value.join('\n'),
                                });
                            }
                        },
                    );
                    pages.push(e);
                }),
            );

            // Object.values(courseHandler.getCourses()).forEach(t => allCourses.push(...t))
            // allCourses.forEach(
            //     (_c, i) => {
            //         (i < 19 ? embed : embed2).addFields({ name: _c["label"], value: _c.description, inline: true })
            //     }
            // )

            const followUpEmbed = new GuidanceEmbed()
                .setTitle("Course Selection")
                .setDescription("Note for AP subjects, you will have to pick the 2 classes " +
                    "that you attend. Academic core subjects are not offered yet. " +
                    "You'll have to wait until someone gives me the course codes because " +
                    "I'm not finding them myself. Sorry!")
                .setFooter({
                    text: `Please don't spam the components. It'll be messy on our side and we'll have to deal with ` +
                        `limits and the rest of that nonsense. If you do happen to go over the maximum amount of ` +
                        `allowed clicks, you'll have to add the rest of the courses by hand.`,
                })
                .setColor(gradient());

            await createPaginator(interaction, pages);
            const message = await interaction.followUp({ embeds: [ followUpEmbed ], components: [ ... row ] });

            // use discord's rest API to fetch the guild and channels needed for the `createMessageComponentCollector`
            // because d.js is dumb and can't figure out the difference between an interaction channel and a channel
            /**
             * fetch interaction data using discord's rest API
             * @param header
             * @param interactionType
             * @returns {Promise<Response>}
             */
            const fetchInteractionData = async (header, interactionType) => {
                return await fetch(`https://discord.com/api/v10/${header}/${interactionType}`, {
                    method: "get",
                    headers: {
                        Authorization: `Bot ${process.env.TOKEN}`,
                    },
                });
            };

            // take the return data and make a `Guild` and `TextChannel` instance
            const guild = new Guild(interaction.client, await (await fetchInteractionData(
                'guilds', interaction.guildId)).json());
            const channel = new TextChannel(guild, await (await fetchInteractionData(
                'channels', interaction.channelId)).json(), interaction.client);

            const collector = channel.createMessageComponentCollector(
                { componentType: ComponentType.SelectMenu, time: 180000, max: 40 });

            // Object to store the selections for each period so overlapping selections are overwritten
            const periodUpdates = [ [ 1, null ], [ 2, null ], [ 3, null ], [ 4, null ] ];
            let shouldSubmitButtonSent = true;

            // listening for collect events
            collector.on('collect', async i => {
                if (!i.isSelectMenu()) return;
                if (i.user.id === interaction.user.id) {
                    if (i.customId.startsWith('courseSelectId')) {
                        await i.deferUpdate();

                        for (const value of i.values) {
                            // const room = courseHandler.courseRooms[course].toString()
                            const course = value.toString();
                            const period = courseHandler.periods(course);

                            await interaction.client.db.execute(
                                "users", "timetable", async collection => {
                                    const findQuery = await collection.findOne({ _id: interaction.user.id });
                                    // if we perform a insertOne on an existing key mongo will raise an error
                                    if (!findQuery) {
                                        const insertSchema = {};
                                        insertSchema._id = interaction.user.id;
                                        if ([ 'HRE1O2a', 'HRE1O2b', 'AMU1O1a', 'AMU1O1b' ].includes(course)) {
                                            // noinspection SpellCheckingInspection
                                            if (course.startsWith('HRE')) {
                                                insertSchema[`p${period}`] = [ course, 'AMU1O1' + course[6] ];
                                            } else {
                                                insertSchema[`p${period}`] = [ course, 'HRE1O2' + course[6] ];
                                            }
                                        } else {
                                            insertSchema[`p${period}`] = course;
                                        }

                                        collection.insertOne(
                                            { ... insertSchema });
                                    } else {
                                        const updateSchema = {};
                                        if ([ 'HRE1O2a', 'HRE1O2b', 'AMU1O1a', 'AMU1O1b' ].includes(course)) {
                                            // noinspection SpellCheckingInspection
                                            if (course.startsWith('HRE')) {
                                                updateSchema[`p${period}`] = [ course, 'AMU1O1' + course[6] ];
                                            } else {
                                                updateSchema[`p${period}`] = [ course, 'HRE1O2' + course[6] ];
                                            }
                                        } else {
                                            updateSchema[`p${period}`] = course;
                                        }

                                        collection.updateOne(
                                            { _id: interaction.user.id },
                                            { $set: { ... updateSchema } });

                                    }
                                    // use this filter to loop through all items already in the list
                                    // and check if any of the items already exist
                                },
                            );
                            if (periodUpdates.filter((p) => {
                                // the course is a duplicate
                                if (p[0] === period) {
                                    // remove the item with the same index as the period
                                    periodUpdates.splice(period - 1, 1);
                                    return true;
                                }
                                return false;
                            })) {
                                // if a music/religion alternate is here then add both of them
                                if ([ 'HRE1O2a', 'HRE1O2b', 'AMU1O1a', 'AMU1O1b' ].includes(course)) {
                                    if (course.startsWith('HRE')) {
                                        periodUpdates.push([ period, `AMU1O1${course[6]} / ${course}` ]);
                                    } else {
                                        periodUpdates.push([ period, `HRE1O2${course[6]} / ${course}` ]);
                                    }
                                } else {
                                    periodUpdates.push([ period, course ]);
                                }
                                periodUpdates.sort();
                            }

                            // noinspection JSUnresolvedVariable
                            // const message = await i.channel.messages.fetch(i.message.id)
                            let _desc = '\n';

                            periodUpdates.sort().forEach(e => {
                                    // check if the content isn't just null like the course placeholders
                                    if (e[1]) _desc += `\n**Period ${e[0]}** - Added course \`${e[1]}\` to your timetable!`;
                                },
                            );
                            // TODO: Add button to indicate whether user is finished picking or not

                            const addedEmbed = message.embeds[0];
                            addedEmbed.data.description = `Note for AP subjects, you will have to pick the 2 classes ` +
                                `that you attend. Academic core subjects are not offered yet. ` +
                                `You'll have to wait until someone gives me the course codes because ` +
                                `I'm not finding them myself. Sorry! ${_desc}`;

                            message.edit({ embeds: [ addedEmbed ] });

                            let containsCourse = 0;
                            await interaction.client.db.execute(
                                "users", "timetable", async collection => {
                                    const findQuery = await collection.findOne({ _id: interaction.user.id });
                                    // loop over the keys in findQuery, if there is a course for the period
                                    // then add one to `containsCourse`
                                    Object.values(findQuery).forEach(k => {
                                            // first key will be the user id so ignore that
                                            if (k && k !== i.user.id) {
                                                containsCourse++;
                                            }
                                        },
                                    );
                                },
                            );

                            // it can't be over four but just in case!
                            // if the submit button has already been sent don't send another one
                            if (containsCourse >= 4 && shouldSubmitButtonSent) {
                                const finishedEmbed = new GuidanceEmbed()
                                    .setDescription("Done adding your courses? Click submit when you're ready.")
                                    .removeThumbnail();
                                const component = new ActionRowBuilder().setComponents(
                                    new ButtonBuilder()
                                        .setLabel("I'm done!")
                                        .setStyle(ButtonStyle.Success)
                                        .setCustomId("submitTimetableButton"),
                                );

                                await i.followUp({ embeds: [ finishedEmbed ], components: [ component ] }).then(
                                    shouldSubmitButtonSent = false,
                                );
                            }
                        }
                    }
                } else {
                    if (i.deferred || i.replied) {
                        await i.followUp({ content: "Those boxes aren't for you!", ephemeral: true });
                    } else {
                        await i.reply({ content: "Those boxes aren't for you!", ephemeral: true });
                    }
                }
            });

            collector.on('end',
                async (i, reason) => {
                    const embed = message.embeds[0];
                    if (reason === 'time') {
                        embed.data.footer = { text: 'Menu timed out.' };

                        message.edit({ embeds: [ embed ] });
                    }
                    if (reason === 'limit') {
                        embed.data.footer = { text: 'Max amount of interactions received.' };

                        message.edit({ embeds: [ embed ] });
                    }
                },
            );
        } else if (subCommand === 'delete') {
            const period = interaction.options.getInteger('period');
            let courses;

            await interaction.client.db.execute(
                "users", "timetable", async collection => {
                    const deleteSchema = {}
                    deleteSchema[`p${period}`] = 1

                    await collection.updateOne({ _id: interaction.user.id }, {$unset: deleteSchema })
                },
            );

            const embed = new SuccessEmbed()
                .setDescription(`Removed all courses for period \`${period}\`!`);
            interaction.reply({ embeds: [ embed ] });

        } else if (subCommand === 'add') {
            const course = interaction.options.getString('course');
            const period = courseHandler.periods(course);

            await interaction.client.db.execute(
                "users", "timetable", async collection => {
                    const schema = {};
                    schema["_id"] = interaction.user.id;
                    schema[`p${period}`] = course;
                    if ([ 'HRE1O2a', 'HRE1O2b', 'AMU1O1a', 'AMU1O1b' ].includes(course)) {
                        // noinspection SpellCheckingInspection
                        if (course.startsWith('HRE')) {
                            schema[`p${period}`] = [ course, 'AMU1O1' + course[6] ];
                        } else {
                            schema[`p${period}`] = [ course, 'HRE1O2' + course[6] ];
                        }
                    }

                    if (await collection.findOne({ _id: interaction.user.id })) {
                        collection.updateOne(
                            { _id: interaction.user.id },
                            { $set: { ... schema } });
                    } else {
                        await collection.insertOne({ ... schema });
                    }
                },
            );

            const embed = new SuccessEmbed()
                .setDescription(`Added course \`${course}\` to your timetable for period \`${period}\`!`);
            interaction.reply({ embeds: [ embed ] });
        }
    },
};