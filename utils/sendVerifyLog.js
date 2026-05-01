const { EmbedBuilder } = require('discord.js');
const ticketConfig = require('../config/ticketConfig');

async function sendTicketLog(guild, title, description, color = 0x5865f2) {
  try {
    const channel = guild.channels.cache.find(
      c => c.name === ticketConfig.ticketLogsChannelName && c.isTextBased()
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Erreur sendTicketLog :', error);
  }
}

module.exports = sendTicketLog;