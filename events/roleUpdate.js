    const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'roleUpdate',

  async execute(oldRole, newRole) {
    try {
      const changes = [];

      if (oldRole.name !== newRole.name) {
        changes.push(`**Nom :** ${oldRole.name} → ${newRole.name}`);
      }

      if (oldRole.hexColor !== newRole.hexColor) {
        changes.push(`**Couleur :** ${oldRole.hexColor} → ${newRole.hexColor}`);
      }

      if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        changes.push('**Permissions :** modifiées');
      }

      if (changes.length === 0) return;

      await sendDiscordLog(
        newRole.guild,
        'roles-logs',
        '✏️ Rôle modifié',
        `**Rôle :** ${newRole.name}\n**ID :** ${newRole.id}\n\n${changes.join('\n')}`,
        0xfaa61a
      );
    } catch (error) {
      console.error('Erreur roleUpdate :', error);
    }
  }
};