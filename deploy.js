// noinspection JSCheckFunctionSignatures,JSUnresolvedVariable

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const chalk = require("chalk");
const createCommands = require("./handlers/commands");
require("dotenv").config();

const { TOKEN, ID, SERVER } = process.env;
console.log(chalk.yellow("deploying slash"));
const rest = new REST({ version: "10" }).setToken(TOKEN);

const commands = createCommands().toJSON().map(command => {
    delete command.execute;
    return command;
});

if (SERVER) {
    rest.put(Routes.applicationGuildCommands(ID, SERVER), { body: commands })
        .then(() => { console.log(chalk.green(`deployed slash to server ${process.env.SERVER}`)); })
        .catch(console.error);
}
else {
    rest.put(Routes.applicationCommands(ID), { body: commands })
        .then(() => { console.log(chalk.green("deployed slash commands globally")); })
        .catch(console.error);
}