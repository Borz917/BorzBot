const { EmbedBuilder } = require('discord.js');

function buildTicketEmbed(title, description, color = 0x5865f2) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

module.exports = buildTicketEmbed;