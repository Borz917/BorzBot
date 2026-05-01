const { EmbedBuilder } = require('discord.js');
const ticketConfig = require('../config/ticketConfig');

async function sendTicketLog(guild, subjectId, title, description, color = 0x5865f2, files = []) {
  try {
    const channelName =
      ticketConfig.ticketLogChannelsBySubject?.[subjectId] ||
      ticketConfig.defaultLogsChannelName ||
      'ticket-logs';

    const channel = guild.channels.cache.find(
      c => c.name === channelName && c.isTextBased()
    );

    if (!channel) {
      console.log(`Salon de logs introuvable : ${channelName}`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    await channel.send({
      embeds: [embed],
      files
    });
  } catch (error) {
    console.error('Erreur sendTicketLog :', error);
  }
}

module.exports = sendTicketLog;