const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    Guild,
    TextChannel,
} = require("discord.js");
const fetch = require("node-fetch");
require("dotenv").config();

// holy this code is ugly

function disableBack(components) {
    components[0].setDisabled(true);
    components[1].setDisabled(true);
}

function disableForward(components) {
    components[2].setDisabled(true);
    components[3].setDisabled(true);
}

function enableBack(components) {
    components[0].setDisabled(false);
    components[1].setDisabled(false);
}

function enableForward(components) {
    components[2].setDisabled(false);
    components[3].setDisabled(false);
}

/**
 *
 * @param {*} interaction
 * @param {*} _pages
 * @param {*} timeout
 * @param {*} components
 * @param {*} caption
 * @param files
 * @returns
 */
module.exports = async (interaction, _pages, files = null, timeout = 180000, components = [
    { type: ComponentType.Button, label: "⏪", style: ButtonStyle.Secondary, custom_id: "first" },
    { type: ComponentType.Button, label: "◀️", style: ButtonStyle.Secondary, custom_id: "prev" },
    { type: ComponentType.Button, label: "▶️", style: ButtonStyle.Secondary, custom_id: "next" },
    { type: ComponentType.Button, label: "⏩", style: ButtonStyle.Secondary, custom_id: "last" },
    { type: ComponentType.Button, label: "⏹️", style: ButtonStyle.Danger, custom_id: "stop" },
], caption = null) => {
    components = components.map(component => {
        return new ButtonBuilder()
            .setLabel(component["label"])
            .setStyle(component["style"])
            .setCustomId(component["custom_id"] += `$${interaction.id}`);
    });
    disableBack(components);

    const pages = _pages.map((page, index) => {
        page.setFooter({
            text: `Page ${index + 1} of ${_pages.length}`,
        });
        return page;
    });

    if (interaction.deferred === false) await interaction.deferReply();

    await interaction.editReply({
        content: caption,
        embeds: [pages[0]],
        components: [new ActionRowBuilder().addComponents(...components)],
    });

    const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${interaction.guildId}`, {
        method: "get",
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
        },
    });
    const channelResponse = await fetch(`https://discord.com/api/v10/channels/${interaction.channelId}`, {
        method: "get",
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
        },
    });
    const guildData = await guildResponse.json();
    const channelData = await channelResponse.json();
    const guild = new Guild(interaction.client, guildData);
    const channel = new TextChannel(guild, channelData, interaction.client);
    const collector = channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: timeout });

    let page = 0;

    collector.on("collect", async button => {
        if (!button.isButton()) return;
        if (button.customId.split("$")[1] !== interaction.id) return;

        if (button.user.id !== interaction.user.id) {
            return button.reply({
                content: "Those aren't your buttons!",
                ephemeral: true,
            });
        }

        switch (button.customId) {
            case components[0].data.custom_id:
                page = 0;
                disableBack(components);
                enableForward(components);
                break;
            case components[1].data.custom_id:
                --page;
                enableForward(components);
                if (page === 0) {
                    disableBack(components);
                }
                break;
            case components[2].data.custom_id:
                ++page;
                enableBack(components);
                if (page === pages.length - 1) {
                    disableForward(components);
                }
                break;
            case components[3].data.custom_id:
                page = pages.length - 1;
                disableForward(components);
                enableBack(components);
                break;
            case components[4].data.custom_id:
                await collector.stop("collectorStopped");
                break;
        }

        await button.update({
            content: caption,
            embeds: [pages[page]],
            // files: [files],
            components: [new ActionRowBuilder().addComponents(...components)],
        });
        collector.resetTimer();
    });

    collector.on("end",
        (_, reason) => {
            components = components.map(component => {
                return component.setDisabled(true);
            });

            if (reason === "collectorStopped") {
                interaction.editReply({
                    embeds: [pages[page].setFooter({ text: "Menu has been ended by user." })],
                    components: [new ActionRowBuilder().addComponents(components)],
                });
            }
            else if (reason === "time") {
                interaction.editReply({
                    embeds: [pages[page].setFooter({ text: "Menu timed out." })],
                    components: [new ActionRowBuilder().addComponents(components)],
                });
            }
        }
    );

    return [collector, interaction];
};