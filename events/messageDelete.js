const { Events } = require('discord.js');
const sendDiscordLog = require('../utils/sendDiscordLog');
const { limitText, formatUser } = require('../utils/logFormat');

module.exports = {
  name: Events.MessageDelete,

  async execute(message) {
    try {
      if (!message.guild) return;
      if (message.author?.bot) return;

      const author = message.author
        ? formatUser(message.author)
        : 'Auteur inconnu';

      await sendDiscordLog(
        message.guild,
        'messages-logs',
        '🗑️ Message supprimé',
        `**Auteur :** ${author}\n` +
        `**Salon :** ${message.channel}\n` +
        `**Message ID :** \`${message.id}\`\n\n` +
        `**Contenu :**\n${limitText(message.content || 'Contenu indisponible.', 1500)}`,
        0xed4245
      );
    } catch (error) {
      console.error('Erreur messageDelete :', error);
    }
  }
};