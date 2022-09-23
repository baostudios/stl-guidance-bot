const { ApplicationCommandOptionType, SlashCommandBuilder } = require("discord.js");
const createPaginator = require("../handlers/paginator");
const gradient = require("../assets/utils/gradient");
const { ErrorEmbed, GuidanceEmbed } = require("../assets/utils/embeds");
const { Course } = require("../assets/data/courses");

// TODO: Autocomplete for course registration
// https://discordjs.guide/interactions/autocomplete.html#enabling-autocomplete

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Check out your shiny profile! Includes timetable information, lunch information, and others")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Will instead show the profile of the specified user')
                .setRequired(false)),
    // name: "profile",
    // description: "Check out your shiny profile! Includes timetable information, lunch information, and others!",
    // options: [
    //     {
    //         name: "user",
    //         description: "Will instead show the profile of the specified user.",
    //         required: false,
    //         type: ApplicationCommandOptionType.User
    //     }
    // ],
    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const _user = interaction.options.getUser('user'); // user is the temporary user
        // because slash commands does not support default options
        const user = _user ? _user : interaction.user;
        const courseHandler = new Course();

        let userInfo;
        await interaction.client.db.execute(
            "users", "userinfo", async collection => {
                userInfo = await collection.findOne({ _id: user.id });
            },
        );
        if (!userInfo) {
            const embed = new ErrorEmbed()
                .setDescription(`
                    ${user === interaction.user ? "You're not registered" :
                        _user.username + ' has not registered themselves'} yet! ` +
                    `Create an account using \`/register\``);

            return interaction.reply({ embeds: [ embed ] });
        }

        const profileEmbed = new GuidanceEmbed()
            .setColor(gradient())
            .setTitle(`${userInfo.name}'s Guidance Profile`)
            .setDescription(userInfo.bio)
            .setThumbnail(user.displayAvatarURL());

        let query;
        await interaction.client.db.execute(
            "users", "timetable", async collection => {
                query = await collection.findOne({ _id: user.id });
            },
        );

        // perhaps the ugliest and least dynamic code I have ever written, but it works
        // and that's all that matters
        profileEmbed.addFields(
            [
                {
                    name: "Period 1",
                    value: `\`\`\`${query['p1'] ? query['p1'] : 'N\\A'}\`\`\``,
                    inline: true,
                },
                {
                    name: "Period 2",
                    value: `\`\`\`${query['p2'] ?
                        (typeof query['p2'] === 'object' ? query['p2'].join(' / ') : query['p2']) : 'N\\A'}\`\`\``,
                    inline: true,
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true,
                },
                {
                    name: "Period 3",
                    value: `\`\`\`${query['p3'] ? query['p3'] : 'N\\A'}\`\`\``,
                    inline: true,
                },
                {
                    name: "Period 4",
                    value: `\`\`\`${query['p4'] ? query['p4'] : 'N\\A'}\`\`\``,
                    inline: true,
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true,
                },
            ],
        );

        interaction.reply({ embeds: [ profileEmbed ] });

        // interaction.reply({ embeds: [embed] });
    },
};