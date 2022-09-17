const { EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ApplicationCommandOptionType } = require("discord.js");
const createPaginator = require("../handlers/paginator")
const gradient = require("../handlers/gradient");

// TODO: Autocomplete for course registration https://discordjs.guide/interactions/autocomplete.html#enabling-autocomplete

module.exports = {
    name: "profile",
    description: "Check out your shiny profile! Includes timetable information, lunch information, and others!",
    options: [
        {
            name: "user",
            description: "Will instead show the profile of the specified user.",
            required: false,
            type: ApplicationCommandOptionType.User
        }
    ],
    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const _user = interaction.options.getUser('user') // user is the temporary user
        // because slash commands does not support default options
        const user = _user ? _user : interaction.user

        let query;
        await interaction.client.db.updateDatabase(
            "users", "userinfo", async collection => {
                query = await collection.findOne({ _id: user.id });
            }
        );
        if ( !query ) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`
                    ${user === interaction.user ? "You're not registered" : _user.username + ' has not registered themselves' } yet! ` +
                    `Create an account using \`/register\``)

            return interaction.reply({ embeds: [embed] });
        }

        const pages = [
            new EmbedBuilder()
                .setColor(gradient())
                .setTitle(`${query.name}'s Guidance Profile`)
                .setDescription(query.bio)
                .setThumbnail(user.avatarURL()),
            new EmbedBuilder()
                .setColor(gradient())
                .setTitle(`page one`)
                .setDescription(`okay`)
                .setThumbnail(user.avatarURL()),
            new EmbedBuilder()
                .setColor(gradient())
                .setTitle(`page two`)
                .setDescription(`lmao`)
                .setThumbnail(user.avatarURL()),
            new EmbedBuilder()
                .setColor(gradient())
                .setTitle(`page three`)
                .setDescription(`insert creative joke`)
                .setThumbnail(user.avatarURL()),
        ]

        const [collector, _interaction] = await createPaginator(interaction, pages);

        // interaction.reply({ embeds: [embed] });
    },
};