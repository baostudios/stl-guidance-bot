const createCommands = require("../handlers/commands");
const db = require("../handlers/mongo");
const chalk = require("chalk");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        client.commands = createCommands();

        client.db = db();
        // test update to make sure the mongo connection is working
        // there are safeguards when initializing the mongo connection but sometimes it fails
        // after the connection is established
        await client.db.updateDatabase("ready", "ready", async collection => {
            const document = await collection.findOne({_id: "631fb0623af5d19351c9c108"});
            console.log(chalk.bgGreenBright(document.text));
        }).catch(r => {
            console.log(chalk.bgRedBright(`mongodb test update failed\n${r}`));
        });

        // online
        console.log(chalk.bgCyanBright("stl guidance is online"));
    },
};