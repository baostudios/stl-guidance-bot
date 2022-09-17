const { InteractionType, EmbedBuilder} = require("discord.js");
const gradient = require("../handlers/gradient");

module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        if (interaction.type === InteractionType.ApplicationCommand) {
            const command = interaction.client.commands.get(interaction.commandName);
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                interaction.reply({ content: "Don't panic, something went wrong on our end. " +
                        "We'll try our best to sort this out quickly.", ephemeral: true });
            }
        }
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'registerModal') {
                // const inputs = []
                // interaction.fields.fields.forEach( (component, _id) => {
                //     console.log(_id, interaction.fields.getTextInputValue(_id))
                //     inputs.push({ name: _id, value: interaction.fields.getTextInputValue(_id) })
                // })
                // console.log(inputs)
                // update database based on user input from modal
                await interaction.client.db.updateDatabase("users", "userinfo", collection => {
                    collection.insertOne({
                        _id: interaction.user.id,
                        name: interaction.fields.getTextInputValue("nameModalId"),
                        bio: interaction.fields.getTextInputValue("bioModalId"),
                        password: interaction.fields.getTextInputValue("passwordModalId"),
                    });
                });
                const embed = new EmbedBuilder()
                    .setColor(gradient())
                    .setDescription(`All done! Your details have been submitted.`)
                    .setFooter({text: `Make sure to write it down somewhere because we would prefer for information` +
                        ` like this to stay private.`})

                interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
        if (interaction.isSelectMenu()) {
            // TODO: ...
        }
    },
};