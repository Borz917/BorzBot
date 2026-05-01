const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'roleCreate',

  async execute(role) {
    try {
      await sendDiscordLog(
        role.guild,
        'roles-logs',
        '🆕 Rôle créé',
        `**Nom :** ${role.name}\n**ID :** ${role.id}`,
        0x57f287
      );
    } catch (error) {
      console.error('Erreur roleCreate :', error);
    }
  }
};