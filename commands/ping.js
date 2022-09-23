const { SlashCommandBuilder } = require("discord.js");
const gradient = require("../assets/utils/gradient");
const { GuidanceEmbed } = require("../assets/utils/embeds");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pong! Check API, bot and Mongo latency"),
    async execute(interaction) {
        interaction.deferReply().then(() => interaction.fetchReply().then(async i => {
            const botPing = i.createdTimestamp - interaction.createdTimestamp;
            const apiPing = interaction.client.ws.ping;
            let dbPing;
            // const emojiFunction = ping => ping <= 100 ? "green" : (ping <= 300 ? "yellow" : "red");

            await interaction.client.db.execute("ready", "ready", async collection => {
                const start = Date.now();
                await collection.findOne({ text: null });
                const end = Date.now();
                dbPing = end - start;
            });

            const embed = new GuidanceEmbed()
                .setColor(gradient())
                .setTitle("Pong!")
                // .setDescription(`**Bot latency** - \`${botPing}ms\` :${emojiFunction(botPing)}_circle:
                //                  **API latency** - \`${apiPing}ms\` :${emojiFunction(apiPing)}_circle:
                //                  **Database latency** - \`${dbPing}ms\` :${emojiFunction(dbPing)}_circle:`)
                .setDescription(`**Bot latency** - \`${botPing}ms\`
                                 **API latency** - \`${apiPing}ms\`
                                 **Database latency** - \`${dbPing}ms\``);
            interaction.editReply({ embeds: [ embed ] });
        }));
    },
};