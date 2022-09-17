const { EmbedBuilder, SelectMenuBuilder, ActionRowBuilder, ComponentType, Guild, TextChannel, } = require("discord.js");
const { Course } = require("../assets/data/courses")
const gradient = require("../handlers/gradient");
const fetch = require("node-fetch");
const createPaginator = require("../handlers/paginator");

module.exports = {
    name: "timetable",
    description: "Add your courses to your timetable.",
    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        let isRegistered;
        const courseHandler = new Course()

        // check if user is registered
        await interaction.client.db.updateDatabase(
            "users", "userinfo", async collection => {
                isRegistered = await collection.findOne({_id: interaction.user.id});
            }
        );
        if (!isRegistered) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`
                    You're not registered yet! ` +
                    `Create an account using \`/register\``)

            return interaction.reply({embeds: [embed]});
        }

        const pages = [
            new EmbedBuilder()
                .setTitle("Adding Your Courses")
                .setDescription("Hey there! Below you will find a list of course codes that represent your four (or " +
                    "five) classes for the rest of semester 1! To choose a class, simply find the course code for the" +
                    " class that you attend and click it in the select menu!\n\nTo see the list of current list of " +
                    "classes, click the buttons to navigate through the pages.")
                .setColor(gradient())
        ]

        const _courses = courseHandler.courses
        const row = []
        // console.log(Object.entries(_courses))

        // using the getCourses() method and getting the entries we can run a forEach loop to extract all
        // the course information and create a new SelectMenuBuilder
        Object.entries(_courses).forEach(
            (t => {
                const menuTitle = (t[0] === 'ap' ? 'aP' : t[0]).split('_').join(' ').replace(
                    /(^\w)|(\s+\w)/g, l => l === 'and' ? l : l.toUpperCase()) + ' Courses'

                const _codes = courseHandler.codes
                // courses for course label
                const c = courseHandler.getCoursesByName(t[0]);
                const menu = new ActionRowBuilder().addComponents(
                    new SelectMenuBuilder()
                        .setCustomId(`courseSelectId${t[0]}`)
                        .setPlaceholder(`${menuTitle} (e.g. ${c[0].label})`)
                        .setMinValues(1)
                        .setMaxValues(t[0] === 'ap' ? 2 : 1)  // if course id is ap then have a max value of 2 instead of 1
                        .addOptions(c));
                row.push(menu);

                const e = new EmbedBuilder()
                    // ternary operator to determine whether course is aP or otherwise
                    // split the key using underscores then join it together using places
                    // don't capitalize if the string is `and`
                    // regex to capitalize the first letter of every word in a string
                    .setTitle(menuTitle)
                    .setColor(gradient())
                    .setThumbnail("https://cdn.discordapp.com/attachments/1018302806085611600/" +
                        "1020148918677426196/stl_transparent.png")
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
                    _codes[code].push({course: _c["label"], desc: _c["description"]})
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
                                }
                            )
                            // add the field
                            e.addFields({
                                name: courseHandler.codeId[course[0]], value: _value.join('\n')
                            })
                        }
                    }
                )
                pages.push(e);
            })
        );

        // Object.values(courseHandler.getCourses()).forEach(t => allCourses.push(...t))
        // allCourses.forEach(
        //     (_c, i) => {
        //         (i < 19 ? embed : embed2).addFields({ name: _c["label"], value: _c.description, inline: true })
        //     }
        // )

        const followUpEmbed = new EmbedBuilder()
            .setDescription("Note for AP subjects, you will have to" +
                " pick the **2** classes that you attend.")
            .setFooter({ text: "Academic core subjects are not offered yet. You'll have to wait until someone " +
                "gives me the course codes because I'm not finding them myself. Sorry!" })
            .setColor(gradient())

        await createPaginator(interaction, pages);
        await interaction.followUp({ embeds: [ followUpEmbed ], components: [ ...row ] });

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
        }

        // take the return data and make a `Guild` and `TextChannel` instance
        const guild = new Guild(interaction.client, await (await fetchInteractionData(
            'guilds', interaction.guildId)).json());
        const channel = new TextChannel(guild, await (await fetchInteractionData(
            'channels', interaction.channelId)).json(), interaction.client);

        const collector = channel.createMessageComponentCollector(
            { componentType: ComponentType.SelectMenu, time: 18000 });

        let cachedCourseMessage;

        // listening for collect events
        collector.on('collect', async i => {
            if (i.user.id === interaction.user.id) {
                if (i.customId.startsWith('courseSelectId')) {
                    for (const value of i.values) {
                        const course = value.toString()
                        const room = courseHandler.courseRooms[course].toString()
                        const period = courseHandler.coursePeriods[course].toString()

                        await interaction.client.db.updateDatabase(
                            "users", "timetable", async collection => {
                                const findQuery = await collection.findOne({_id: interaction.user.id})
                                // if we perform a insertOne on an existing key mongo will raise an error
                                if (!findQuery) {
                                    const insertQuery = {}
                                    insertQuery._id = interaction.user.id
                                    insertQuery[`p${period}`] = course

                                    collection.insertOne(
                                        {...insertQuery});
                                } else {
                                    const updateQuery = {}
                                    updateQuery[`p${period}`] = course

                                    collection.updateOne(
                                        {_id: interaction.user.id,},
                                        {$set: {...updateQuery}});
                                    // isUpdated = collection.updateOne(
                                    //     {_id: interaction.user.id,},
                                    //     {$set: {value: value.toString()}});
                                }
                            });
                        const embed = new EmbedBuilder()
                            .setColor(gradient())
                            .setDescription(`Added course \`${course} / ${room.startsWith('GY') ? "" : "Room"} ${room} / ` +
                                `Period ${period}\` to your timetable!`);
                        // .setDescription(`Your timetable has been ${isUpdated ? 'updated' : 'submitted'}!`);
                        // follow up, else reply
                        if (i.deferred || i.replied) {
                            await channel.messages.fetch(cachedCourseMessage).then((m) => {
                                m.edit({embeds: [embed]});
                            });

                            // await .editReply({embeds: [embed]}).then(
                            //     m => cachedCourseMessage = m.id);
                        }
                        else {
                            await i.reply({embeds: [embed]}).then(
                                m => cachedCourseMessage = m.id);
                        }
                        // i.reply({ content: `you picked the ${i.values.toString()} course (testing!!! don't use)` })
                    }
                }
            }
            else {
                await i.reply({content: "Those boxes aren't for you!", ephemeral: true})
            }
        });
    },
};