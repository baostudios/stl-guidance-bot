const { EmbedBuilder, ModalBuilder, TextInputBuilder, SelectMenuBuilder, ActionRowBuilder, TextInputStyle, ComponentType, MessageActionRow, } = require("discord.js");
const { Modal, TextInputComponent, SelectMenuComponent, showModal } = require('discord-modals'); // Import all
const gradient = require("../handlers/gradient");

module.exports = {
    name: "register",
    description: "Create your very own unique Guidance profile.",
    /**
     *
     * @param interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        let isRegistered;
        await interaction.client.db.updateDatabase("users", "userinfo", async collection => {
            isRegistered = await collection.findOne({ _id: interaction.user.id });
        });
        if ( isRegistered ) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`
                    You're already registered! Need to update your name? 
                    Try accessing to your profile using \`/profile\`!)
                `)

            return interaction.reply({ embeds: [embed] });
        }
        const fields = {
            name: new TextInputBuilder()
                .setCustomId('nameModalId')
                .setLabel("What's your name?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(30)
                .setPlaceholder(interaction.user.username),
            bio: new TextInputBuilder()
                .setCustomId('bioModalId')
                .setLabel("What will your bio be?")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setMaxLength(250)
                .setPlaceholder("Give us a short description of yourself!"),
            password: new TextInputBuilder()
                .setCustomId('passwordModalId')
                .setLabel("Create a short password for your account.")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(100)
                .setMinLength(4)
                .setPlaceholder("This is entirely confidential and will stored safely."),
        }

        const modal = new ModalBuilder()
            .setCustomId('registerModal')
            .setTitle('Welcome!')
            .setComponents(
                new ActionRowBuilder().setComponents(fields.name),
                new ActionRowBuilder().setComponents(fields.bio),
                new ActionRowBuilder().setComponents(fields.password),
            )

        await interaction.showModal(modal);
    },
};