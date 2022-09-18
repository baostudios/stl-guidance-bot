const { SelectMenuBuilder, ActionRowBuilder, ComponentType, Guild, TextChannel, } = require("discord.js");
const { ErrorEmbed, GuidanceEmbed } = require("../assets/utils/embeds")
const { Course } = require("../assets/data/courses")
const gradient = require("../assets/utils/gradient");
const createPaginator = require("../handlers/paginator");

const fetch = require("node-fetch");
// const log = require("../assets/utils/logger")

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
            const embed = new ErrorEmbed()
                .setDescription(`
                    You're not registered yet! ` +
                    `Create an account using \`/register\``)

            return interaction.reply({ embeds: [ embed ] });
        }

        const pages = [
            new GuidanceEmbed()
                .setTitle("Adding Your Courses")
                .setDescription("Hey there! Below you will find a list of course codes that represent your four (or " +
                    "five) classes for the rest of semester 1! To choose a class, simply find the course code for the" +
                    " class that you attend and click it in the select menu!\nTo see the list of current list of " +
                    "classes, click the buttons to navigate through the pages.")
                .setColor(gradient())
        ]

        const _courses = courseHandler.courses
        const row = []

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
                        .setMinValues(t[0] === 'ap' ? 2 : 1)
                        .setMaxValues(t[0] === 'ap' ? 2 : 1)  // if course id is ap then have a max value of 2 instead of 1
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

        const followUpEmbed = new GuidanceEmbed()
            .setTitle("Course Selection")
            .setDescription(`You only have ten tries to pick the right courses before this menu ` +
                `will automatically close because of your poor clicking skills, so make sure ` +
                `the class you pick is actually the one you attend! Otherwise you'll have ` +
                `to run this command again.`)
            .setFooter({ text: "Note for AP subjects, you will have to pick the 2 classes " +
                    "that you attend. Academic core subjects are not offered yet. " +
                    "You'll have to wait until someone gives me the course codes because " +
                    "I'm not finding them myself. Sorry!" })
            .setColor(gradient())

        await createPaginator(interaction, pages);
        const message = await interaction.followUp({ embeds: [ followUpEmbed ], components: [ ...row ] });

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
            { componentType: ComponentType.SelectMenu, time: 180000, max: 10 });

        // Object to store the selections for each period so overlapping selections are overwritten
        const periodUpdates = [[1, null],[2, null],[3, null],[4, null]]

        // listening for collect events
        collector.on('collect', async i => {
            console.log(i.isSelectMenu())
            if (!i.isSelectMenu()) return;
            if (i.user.id === interaction.user.id) {
                if (i.customId.startsWith('courseSelectId')) {
                    await i.deferUpdate();

                    for (const value of i.values) {
                        // const room = courseHandler.courseRooms[course].toString()
                        const course = value.toString()
                        const period = courseHandler.coursePeriods[course]

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

                                }
                                // use this filter to loop through all items already in the list
                                // and check if any of the items already exist
                            }
                        );
                        if (periodUpdates.filter((p) => {
                            if (['HRE1O2a', 'HRE1O2b', 'AMU1O1a', 'AMU1O1b'].includes(course)) { return true; }
                            else if (p[0] === period) {
                                periodUpdates.splice(period - 1, 1);
                                return true;
                            } return false;
                        })) {
                            periodUpdates.push([period, course]);
                            periodUpdates.sort()
                        }

                        // noinspection JSUnresolvedVariable
                        // const message = await i.channel.messages.fetch(i.message.id)
                        let _desc = '\n';

                        periodUpdates.sort().forEach(e =>
                            {
                                // check if the content isn't just null like the course placeholders
                                if (e[1]) _desc += `\n**Period ${e[0]}** - Added course \`${e[1]}\` to your timetable!`;
                            }
                        )
                        // TODO: Add button to indicate whether user is finished picking or not
                        // const addedEmbed = new GuidanceEmbed()
                        //     .setColor(gradient())
                        //     .setTitle("Course Selection")
                        //     .setDescription(`You only have ten tries to pick the right courses before this menu ` +
                        //         `will automatically close because of your poor clicking skills, so make sure ` +
                        //         `the class you pick is actually the one you attend! Otherwise you'll have ` +
                        //         `to run this command again. ${_desc}`)
                        //     .setFooter({ text: "Note for AP subjects, you will have to pick the 2 classes " +
                        //             "that you attend. Academic core subjects are not offered yet. " +
                        //             "You'll have to wait until someone gives me the course codes because " +
                        //             "I'm not finding them myself. Sorry!" })

                            //     `\nAdded course \`${course} / ${room.startsWith('GY') ? "" : "Room"} ${room} / ` +
                            // `Period ${period}\` to your timetable!`

                        const addedEmbed = message.embeds[0];
                        addedEmbed.data.description = `You only have ten tries to pick the right courses before this menu ` +
                            `will automatically close because of your poor clicking skills, so make sure ` +
                            `the class you pick is actually the one you attend! Otherwise you'll have ` +
                            `to run this command again. ${_desc}`

                        message.edit({ embeds: [addedEmbed] });

                        // follow up, else reply
                        // if (i.deferred || i.replied) {
                        //
                        //     await i.editReply({embeds: [addedEmbed]});
                        //     // await channel.messages.fetch(cachedCourseMessage).then((m) => {
                        //     //     m.edit({embeds: [addedEmbed]});
                        //     // });
                        //
                        //     // await .editReply({embeds: [embed]}).then(
                        //     //     m => cachedCourseMessage = m.id);
                        // }
                        // else {
                        //     await i.deferReply()
                        //     await i.editReply({embeds: [addedEmbed]});
                        //
                        //     // if (!cachedCourseMessage) {
                        //     // } else {
                        //     //     log.info(cachedCourseMessage)
                        //     //     // const m = await i.channel.messages.fetch(cachedCourseMessage)
                        //     //     log.info(m)
                        //     //
                        //     //     await m.edit({embeds: [embed]});
                        //     // }
                        // }
                        // i.reply({ content: `you picked the ${i.values.toString()} course (testing!!! don't use)` })
                    }
                }
            }
            else {
                await i.reply({content: "Those boxes aren't for you!", ephemeral: true})
            }
        });

        collector.on('end',
            async (i, reason) => {
                if (reason === 'time') {
                    const embed = message.embeds[0];
                    embed.data.footer = { text: 'Menu timed out.' }

                    message.edit({ embeds: [ embed ] });
                }
            }
        );
    },
};