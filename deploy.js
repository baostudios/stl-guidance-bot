// noinspection JSCheckFunctionSignatures,JSUnresolvedVariable
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

console.log(chalk.yellow("deploying slash"));
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const { BOT_TOKEN, ID, SERVER } = process.env;
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);


if (SERVER) {
    rest.put(Routes.applicationGuildCommands(ID, SERVER), { body: commands })
        .then(() => {
            console.log(chalk.green(`deployed slash to server ${process.env.SERVER}`));
        })
        .catch(console.error);
} else {
    rest.put(Routes.applicationCommands(ID), { body: commands })
        .then(() => {
            console.log(chalk.green("deployed slash commands globally"));
        })
        .catch(console.error);
}