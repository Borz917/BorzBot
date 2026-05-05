const { EmbedBuilder } = require('discord.js');
const { getServerConfig } = require('./serverConfig');

const logTypeToConfigKey = {
  'moderation-logs': 'moderation',
  'voice-logs': 'voice',
  'messages-logs': 'messages',
  'boost-logs': 'boost',
  'roles-logs': 'roles',
  'raid-logs': 'raid',
  'support-logs': 'support',
  'support-general-logs': 'support',

  moderation: 'moderation',
  voice: 'voice',
  messages: 'messages',
  boost: 'boost',
  roles: 'roles',
  raid: 'raid',
  support: 'support'
};

function normalizeColor(color) {
  if (typeof color === 'number') return color;

  if (typeof color === 'string') {
    const clean = color.replace('#', '').trim();

    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      return parseInt(clean, 16);
    }
  }

  return 0x5865f2;
}

async function sendDiscordLog(guild, logType, title, description, color = 0x5865f2, files = []) {
  try {
    if (!guild) return false;

    const config = getServerConfig(guild.id);
    const configKey = logTypeToConfigKey[logType] || logType;
    const channelId = config.logs?.[configKey];

    let logChannel = null;

    if (channelId) {
      logChannel = guild.channels.cache.get(channelId);
    }

    if (!logChannel) {
      const fallbackNames = [
        logType,
        `${configKey}-logs`,
        'moderation-logs',
        'logs'
      ];

      logChannel = guild.channels.cache.find(channel =>
        fallbackNames.includes(channel.name)
      );
    }

    if (!logChannel || !logChannel.isTextBased()) {
      return false;
    }

    const embed = new EmbedBuilder()
      .setTitle(title || '📋 Log')
      .setDescription(description ? String(description).slice(0, 4096) : 'Aucune description.')
      .setColor(normalizeColor(color))
      .setTimestamp();

    await logChannel.send({
      embeds: [embed],
      files: Array.isArray(files) ? files : []
    });

    return true;
  } catch (error) {
    console.error('❌ Erreur sendDiscordLog :', error);
    return false;
  }
}

module.exports = sendDiscordLog;