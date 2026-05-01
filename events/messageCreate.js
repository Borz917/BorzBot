const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    try {
      if (message.author.bot) return;

      console.log('--- MESSAGE REÇU ---');
      console.log('Auteur :', message.author.tag);
      console.log('Contenu :', message.content);
      console.log('Guild ? :', !!message.guild);
      console.log('Channel type :', message.channel.type);

      if (!message.guild) {
        await message.channel.send('✅ DM bien reçu');
      }
    } catch (error) {
      console.error('Erreur test DM :', error);
    }
  }
};