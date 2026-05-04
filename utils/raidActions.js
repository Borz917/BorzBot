const { ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');
const sendDiscordLog = require('./sendDiscordLog');

async function lockServer(guild, reason = 'Anti-raid BorzBot') {
  const locked = [];
  const failed = [];

  const channels = guild.channels.cache.filter(channel =>
    channel.type === ChannelType.GuildText ||
    channel.type === ChannelType.GuildAnnouncement
  );

  for (const channel of channels.values()) {
    try {
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false
      });

      locked.push(channel.name);
    } catch {
      failed.push(channel.name);
    }
  }

  await sendDiscordLog(
    guild,
    'raid-logs',
    '🔒 Serveur verrouillé',
    `**Raison :** ${reason}\n` +
    `**Salons verrouillés :** ${locked.length}\n` +
    `**Échecs :** ${failed.length}`,
    0xed4245
  );

  return {
    locked,
    failed
  };
}

async function unlockServer(guild, reason = 'Déverrouillage manuel') {
  const unlocked = [];
  const failed = [];

  const channels = guild.channels.cache.filter(channel =>
    channel.type === ChannelType.GuildText ||
    channel.type === ChannelType.GuildAnnouncement
  );

  for (const channel of channels.values()) {
    try {
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: null
      });

      unlocked.push(channel.name);
    } catch {
      failed.push(channel.name);
    }
  }

  await sendDiscordLog(
    guild,
    'raid-logs',
    '🔓 Serveur déverrouillé',
    `**Raison :** ${reason}\n` +
    `**Salons déverrouillés :** ${unlocked.length}\n` +
    `**Échecs :** ${failed.length}`,
    0x57f287
  );

  return {
    unlocked,
    failed
  };
}

async function sendRaidAlert(guild, member, recentJoins, raidConfig) {
  await sendDiscordLog(
    guild,
    'raid-logs',
    '🚨 Raid détecté',
    `**Nouveau membre :** ${member.user.tag}\n` +
    `**ID :** ${member.id}\n` +
    `**Arrivées :** ${recentJoins.length}/${raidConfig.joinsLimit}\n` +
    `**Intervalle :** ${raidConfig.intervalMs / 1000}s\n` +
    `**Action :** ${raidConfig.action}`,
    0xed4245
  );
}

module.exports = {
  lockServer,
  unlockServer,
  sendRaidAlert
};