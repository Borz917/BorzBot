const { ChannelType, PermissionsBitField } = require('discord.js');
const { getServerConfig } = require('./serverConfig');
const sendDiscordLog = require('./sendDiscordLog');

async function lockGuild(guild, moderatorTag = 'Système anti-raid', reason = 'Raid lock') {
  const config = getServerConfig(guild.id);
  const ignoredChannelIds = config.raid?.lockIgnoredChannelIds || [];

  let lockedCount = 0;
  let failedCount = 0;

  const channels = guild.channels.cache.filter(channel =>
    (
      channel.type === ChannelType.GuildText ||
      channel.type === ChannelType.GuildAnnouncement
    ) &&
    !ignoredChannelIds.includes(channel.id)
  );

  for (const channel of channels.values()) {
    try {
      const botPermissions = channel.permissionsFor(guild.members.me);

      if (!botPermissions?.has(PermissionsBitField.Flags.ManageChannels)) {
        failedCount++;
        continue;
      }

      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: false
      }, {
        reason
      });

      lockedCount++;
    } catch {
      failedCount++;
    }
  }

  await sendDiscordLog(
    guild,
    'raid-logs',
    '🚨 Serveur verrouillé',
    `**Par :** ${moderatorTag}\n` +
    `**Salons verrouillés :** ${lockedCount}\n` +
    `**Échecs :** ${failedCount}\n` +
    `**Raison :** ${reason}`,
    0xed4245
  );

  return {
    lockedCount,
    failedCount
  };
}

async function unlockGuild(guild, moderatorTag = 'Système anti-raid', reason = 'Raid unlock') {
  const config = getServerConfig(guild.id);
  const ignoredChannelIds = config.raid?.lockIgnoredChannelIds || [];

  let unlockedCount = 0;
  let failedCount = 0;

  const channels = guild.channels.cache.filter(channel =>
    (
      channel.type === ChannelType.GuildText ||
      channel.type === ChannelType.GuildAnnouncement
    ) &&
    !ignoredChannelIds.includes(channel.id)
  );

  for (const channel of channels.values()) {
    try {
      const botPermissions = channel.permissionsFor(guild.members.me);

      if (!botPermissions?.has(PermissionsBitField.Flags.ManageChannels)) {
        failedCount++;
        continue;
      }

      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        SendMessages: null
      }, {
        reason
      });

      unlockedCount++;
    } catch {
      failedCount++;
    }
  }

  await sendDiscordLog(
    guild,
    'raid-logs',
    '✅ Serveur déverrouillé',
    `**Par :** ${moderatorTag}\n` +
    `**Salons déverrouillés :** ${unlockedCount}\n` +
    `**Échecs :** ${failedCount}\n` +
    `**Raison :** ${reason}`,
    0x57f287
  );

  return {
    unlockedCount,
    failedCount
  };
}

module.exports = {
  lockGuild,
  unlockGuild
};