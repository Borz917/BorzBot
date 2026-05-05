const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'roleCreate',

  async execute(role) {
    try {
      await sendDiscordLog(
        role.guild,
        'roles-logs',
        '🎭 Rôle créé',
        `**Rôle :** ${role}\n` +
        `**Nom :** \`${role.name}\`\n` +
        `**ID :** \`${role.id}\`\n` +
        `**Couleur :** ${role.hexColor}\n` +
        `**Mentionnable :** ${role.mentionable ? 'Oui' : 'Non'}\n` +
        `**Affiché séparément :** ${role.hoist ? 'Oui' : 'Non'}`,
        0x57f287
      );
    } catch (error) {
      console.error('Erreur roleCreate :', error);
    }
  }
};