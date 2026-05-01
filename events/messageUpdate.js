const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'messageUpdate',

  async execute(oldMessage, newMessage) {
    try {
      if (!oldMessage.guild || oldMessage.author?.bot) return;
      if (oldMessage.content === newMessage.content) return;

      await sendDiscordLog(
        oldMessage.guild,
        'messages-logs',
        '✏️ Message modifié',
        `**Auteur :** ${oldMessage.author.tag}\n**Salon :** ${oldMessage.channel}\n\n**Avant :**\n${oldMessage.content || '*Aucun contenu*'}\n\n**Après :**\n${newMessage.content || '*Aucun contenu*'}`,
        0xfaa61a
      );
    } catch (error) {
      console.error('Erreur messageUpdate :', error);
    }
  }
};