const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'roleDelete',

  async execute(role) {
    try {
      await sendDiscordLog(
        role.guild,
        'roles-logs',
        '🗑️ Rôle supprimé',
        `**Nom :** \`${role.name}\`\n` +
        `**ID :** \`${role.id}\`\n` +
        `**Couleur :** ${role.hexColor}\n` +
        `**Mentionnable :** ${role.mentionable ? 'Oui' : 'Non'}\n` +
        `**Affiché séparément :** ${role.hoist ? 'Oui' : 'Non'}`,
        0xed4245
      );
    } catch (error) {
      console.error('Erreur roleDelete :', error);
    }
  }
};