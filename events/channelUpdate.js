const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'channelUpdate',

  async execute(oldChannel, newChannel) {
    try {
      if (!newChannel.guild) return;

      const changes = [];

      if (oldChannel.name !== newChannel.name) {
        changes.push(`**Nom :** ${oldChannel.name} → ${newChannel.name}`);
      }

      if (oldChannel.parentId !== newChannel.parentId) {
        changes.push('**Catégorie :** changée');
      }

      if (changes.length === 0) return;

      await sendDiscordLog(
        newChannel.guild,
        'raid-logs',
        '✏️ Salon modifié',
        `**Salon :** ${newChannel.name}\n**ID :** ${newChannel.id}\n\n${changes.join('\n')}`,
        0xfaa61a
      );
    } catch (error) {
      console.error('Erreur channelUpdate :', error);
    }
  }
};