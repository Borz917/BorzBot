const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'roleUpdate',

  async execute(oldRole, newRole) {
    try {
      const changes = [];

      if (oldRole.name !== newRole.name) {
        changes.push(`**Nom :** \`${oldRole.name}\` → \`${newRole.name}\``);
      }

      if (oldRole.hexColor !== newRole.hexColor) {
        changes.push(`**Couleur :** \`${oldRole.hexColor}\` → \`${newRole.hexColor}\``);
      }

      if (oldRole.mentionable !== newRole.mentionable) {
        changes.push(
          `**Mentionnable :** \`${oldRole.mentionable ? 'Oui' : 'Non'}\` → \`${newRole.mentionable ? 'Oui' : 'Non'}\``
        );
      }

      if (oldRole.hoist !== newRole.hoist) {
        changes.push(
          `**Affiché séparément :** \`${oldRole.hoist ? 'Oui' : 'Non'}\` → \`${newRole.hoist ? 'Oui' : 'Non'}\``
        );
      }

      if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        changes.push('**Permissions :** modifiées');
      }

      if (!changes.length) return;

      await sendDiscordLog(
        newRole.guild,
        'roles-logs',
        '🔧 Rôle modifié',
        `**Rôle :** ${newRole}\n` +
        `**ID :** \`${newRole.id}\`\n\n` +
        changes.join('\n'),
        0xfaa61a
      );
    } catch (error) {
      console.error('Erreur roleUpdate :', error);
    }
  }
};