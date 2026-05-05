const { Events } = require('discord.js');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: Events.ChannelUpdate,

  async execute(oldChannel, newChannel) {
    try {
      if (!newChannel.guild) return;

      const changes = [];

      if (oldChannel.name !== newChannel.name) {
        changes.push(`**Nom :** \`${oldChannel.name}\` → \`${newChannel.name}\``);
      }

      if (oldChannel.parentId !== newChannel.parentId) {
        changes.push(
          `**Catégorie :** \`${oldChannel.parent?.name || 'Aucune'}\` → \`${newChannel.parent?.name || 'Aucune'}\``
        );
      }

      if ('rateLimitPerUser' in oldChannel && oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        changes.push(
          `**Slowmode :** \`${oldChannel.rateLimitPerUser}s\` → \`${newChannel.rateLimitPerUser}s\``
        );
      }

      if (!changes.length) return;

      await sendDiscordLog(
        newChannel.guild,
        'moderation-logs',
        '🔧 Salon modifié',
        `**Salon :** ${newChannel}\n` +
        `**ID :** \`${newChannel.id}\`\n\n` +
        changes.join('\n'),
        0xfaa61a
      );
    } catch (error) {
      console.error('Erreur channelUpdate :', error);
    }
  }
};