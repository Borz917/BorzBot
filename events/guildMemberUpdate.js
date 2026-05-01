const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'guildMemberUpdate',

  async execute(oldMember, newMember) {
    try {
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

      if (addedRoles.size === 0 && removedRoles.size === 0) return;

      let description = `**Membre :** ${newMember.user.tag}\n**ID :** ${newMember.id}\n\n`;

      if (addedRoles.size > 0) {
        description += `**➕ Rôles ajoutés :**\n${addedRoles.map(r => `${r}`).join('\n')}\n\n`;
      }

      if (removedRoles.size > 0) {
        description += `**➖ Rôles retirés :**\n${removedRoles.map(r => `${r}`).join('\n')}`;
      }

      await sendDiscordLog(
        newMember.guild,
        'roles-logs',
        '🎭 Modification des rôles',
        description,
        0x5865f2
      );
    } catch (error) {
      console.error('Erreur guildMemberUpdate :', error);
    }
  }
};