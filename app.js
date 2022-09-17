const { Client } = require("discord.js");
const fs = require("fs");
const path = require("path");
const log = require("./handlers/logger")

require("dotenv").config();

const client = new Client({ intents: [] });

client.on('ready', () => log.info('stl guidance is online'));
client.on('debug', m => log.debug(m));
client.on('warn', m => log.warn(m));
client.on('error', m => log.error(m));

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// noinspection JSIgnoredPromiseFromCall
client.login(process.env.TOKEN);