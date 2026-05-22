const { Events } = require('discord.js');
const sendDiscordLog = require('../utils/sendDiscordLog');
const { limitText, formatUser } = require('../utils/logFormat');

module.exports = {
  name: Events.MessageUpdate,

  async execute(oldMessage, newMessage) {
    try {
      if (!newMessage.guild) return;
      if (newMessage.author?.bot) return;

      if (oldMessage.partial) {
        oldMessage = await oldMessage.fetch().catch(() => oldMessage);
      }

      if (newMessage.partial) {
        newMessage = await newMessage.fetch().catch(() => newMessage);
      }

      const oldContent = oldMessage.content || '';
      const newContent = newMessage.content || '';

      if (oldContent === newContent) return;

      await sendDiscordLog(
        newMessage.guild,
        'messages-logs',
        '✏️ Message modifié',
        `**Auteur :** ${formatUser(newMessage.author)}\n` +
        `**Salon :** ${newMessage.channel}\n` +
        `**Message ID :** \`${newMessage.id}\`\n` +
        `**Lien :** ${newMessage.url}\n\n` +
        `**Avant :**\n${limitText(oldContent || 'Indisponible', 1000)}\n\n` +
        `**Après :**\n${limitText(newContent || 'Indisponible', 1000)}`,
        0xfaa61a
      );
    } catch (error) {
      console.error('Erreur messageUpdate :', error);
    }
  }
};