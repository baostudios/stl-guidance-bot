const { Collection } = require("discord.js");
const fs = require("fs");

module.exports = () => {
    const commands = new Collection();
    const commandFiles = fs.readdirSync(`./commands/`).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        commands.set(command.name, command);
    }
    return commands;
};