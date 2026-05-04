const { EmbedBuilder } = require('discord.js');
const { getServerConfig } = require('./serverConfig');

const fallbackChannels = {
  moderation: 'moderation-logs',
  voice: 'voice-logs',
  messages: 'messages-logs',
  boost: 'boost-logs',
  roles: 'roles-logs',
  raid: 'raid-logs',
  support: 'support-general-logs'
};

function detectLogType(channelName) {
  const entry = Object.entries(fallbackChannels).find(([, name]) => name === channelName);
  return entry ? entry[0] : null;
}

async function sendDiscordLog(guild, channelName, title, description, color = 0x5865f2) {
  try {
    const config = getServerConfig(guild.id);
    const logType = detectLogType(channelName);

    let channel = null;

    if (logType && config.logs?.[logType]) {
      channel = guild.channels.cache.get(config.logs[logType]);
    }

    if (!channel) {
      channel = guild.channels.cache.find(
        c => c.name === channelName && c.isTextBased()
      );
    }

    if (!channel) {
      console.log(`Salon de logs introuvable : ${channelName}`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description || 'Aucune description.')
      .setColor(color)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Erreur sendDiscordLog :', error);
  }
}

module.exports = sendDiscordLog;