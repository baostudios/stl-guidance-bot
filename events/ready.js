const { Collection } = require("discord.js");
const db = require("../handlers/mongo");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        client.commands = new Collection();
        const commandFiles = fs.readdirSync(`./commands/`).filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            client.commands.set(command.data.name, command);
        }

        client.db = db();
        // test update to make sure the mongo connection is working
        // there are safeguards when initializing the mongo connection but sometimes it fails
        // after the connection is established
        await client.db.execute("ready", "ready", async collection => {
            const document = await collection.findOne({ _id: "631fb0623af5d19351c9c108" });
            console.log(chalk.bgGreenBright(document.text));
        }).catch(r => {
            console.log(chalk.bgRedBright(`mongodb test update failed\n${r}`));
        });

        // online
        console.log(chalk.bgCyanBright("stl guidance is online"));
    },
};