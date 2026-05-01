const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'messageDelete',

  async execute(message) {
    try {
      if (!message.guild || message.author?.bot) return;

      await sendDiscordLog(
        message.guild,
        'messages-logs',
        '🗑️ Message supprimé',
        `**Auteur :** ${message.author.tag}\n**Salon :** ${message.channel}\n\n**Contenu :**\n${message.content || '*Aucun contenu*'}`,
        0xed4245
      );
    } catch (error) {
      console.error('Erreur messageDelete :', error);
    }
  }
};