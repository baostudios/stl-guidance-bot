const { EmbedBuilder } = require("discord.js");
const gradient = require("./gradient");

class GuidanceEmbed extends EmbedBuilder {
    constructor() {
        super();

        this.setColor(gradient());
        this.setThumbnail("https://raw.githubusercontent.com/thekevinlab/" +
            "stl-guidance-bot/master/assets/img/stl_transparent.png");
    }

    /**
     * remove the thumbnail in the embed
     * @returns {null}
     */
    removeThumbnail() {
        return this.setThumbnail(null);
    }
}

class ErrorEmbed extends EmbedBuilder {
    constructor() {
        super();

        this.setColor("Red");
    }
}

class SuccessEmbed extends EmbedBuilder {
    constructor() {
        super();

        this.setColor(gradient());
    }
}

module.exports = { ErrorEmbed, SuccessEmbed, GuidanceEmbed };