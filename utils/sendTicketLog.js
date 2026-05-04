const { EmbedBuilder } = require('discord.js');
const ticketConfig = require('../config/ticketConfig');
const { getServerConfig } = require('./serverConfig');

async function sendTicketLog(guild, subjectId, title, description, color = 0x5865f2, files = []) {
  try {
    const serverConfig = getServerConfig(guild.id);

    let channel = null;

    if (serverConfig.logs?.support) {
      channel = guild.channels.cache.get(serverConfig.logs.support);
    }

    if (!channel) {
      const channelName =
        ticketConfig.ticketLogChannelsBySubject?.[subjectId] ||
        ticketConfig.defaultLogsChannelName ||
        'ticket-logs';

      channel = guild.channels.cache.find(
        c => c.name === channelName && c.isTextBased()
      );
    }

    if (!channel) {
      console.log(`Salon de logs ticket introuvable pour : ${subjectId}`);
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