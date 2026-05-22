const { Events } = require('discord.js');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: Events.GuildMemberUpdate,

  async execute(oldMember, newMember) {
    try {
      if (newMember.user.bot) return;

      const changes = [];

      if (oldMember.nickname !== newMember.nickname) {
        changes.push(
          `**Surnom :** \`${oldMember.nickname || 'Aucun'}\` → \`${newMember.nickname || 'Aucun'}\``
        );
      }

      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

      if (addedRoles.size > 0) {
        changes.push(
          `**Rôles ajoutés :** ${addedRoles.map(role => role.toString()).join(', ')}`
        );
      }

      if (removedRoles.size > 0) {
        changes.push(
          `**Rôles retirés :** ${removedRoles.map(role => role.name).join(', ')}`
        );
      }

      if (!changes.length) return;

      await sendDiscordLog(
        newMember.guild,
        'roles-logs',
        '👤 Membre modifié',
        `**Membre :** ${newMember.user.tag} (${newMember.id})\n\n` +
        changes.join('\n'),
        0xfaa61a
      );
    } catch (error) {
      console.error('Erreur guildMemberUpdate :', error);
    }
  }
};