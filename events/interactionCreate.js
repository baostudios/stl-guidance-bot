const { InteractionType } = require("discord.js");
const { ErrorEmbed, SuccessEmbed } = require("../assets/utils/embeds");
const { Course } = require("../assets/data/courses");

module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        const courseHandler = new Course();

        if (interaction.type === InteractionType.ApplicationCommand) {
            const command = interaction.client.commands.get(interaction.commandName);
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                const embed = new ErrorEmbed()
                    .setDescription("Don't panic, something went wrong on our end. " +
                        "We'll try our best to sort this out quickly.");
                interaction.reply({ embeds: [ embed ], ephemeral: true });
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId === 'submitTimetableButton') {
                const embed = new SuccessEmbed()
                    .setTitle(`Woo hoo!`)
                    .setDescription("To see what we've received, run `/profile` and see if it matches up. " +
                        "If it isn't quite right, `/timetable add` should do the trick.");
                interaction.reply({ embeds: [ embed ] });
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
                await interaction.client.db.execute("users", "userinfo", collection => {
                    collection.insertOne({
                        _id: interaction.user.id,
                        name: interaction.fields.getTextInputValue("nameModalId"),
                        bio: interaction.fields.getTextInputValue("bioModalId"),
                        password: interaction.fields.getTextInputValue("passwordModalId"),
                    });
                });
                const embed = new SuccessEmbed()
                    .setDescription(`All done! Your details have been submitted.`)
                    .setFooter({
                        text: `Make sure to write it down somewhere because we would prefer for information` +
                            ` like this to stay private.`,
                    });

                interaction.reply({ embeds: [ embed ], ephemeral: true });
            }
        }
        if (interaction.isAutocomplete()) {
            if (interaction.commandName === 'timetable') {
                const focused = interaction.options.getFocused();
                const subject = interaction.options.getString('subject');
                // const choices = Object.values(courseHandler.courses).flat()

                const filtered = courseHandler.getCourseLabels(subject).filter(choice => choice.startsWith(focused));
                await interaction.respond(
                    filtered.map(choice => ({
                        name: `${choice} / Period ${courseHandler.periods(choice)} ` +
                            `/ Room ${courseHandler.rooms(choice)}`, value: choice,
                    })),
                );
            }
        }
    },
};