const { SlashCommandBuilder } = require('discord.js');
const sendAnnouncement = require('../utils/sendAnnouncement');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annonceserveur')
    .setDescription('Envoyer une annonce serveur avec @everyone')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message de l’annonce')
        .setRequired(true)
    ),

  async execute(interaction) {
    await sendAnnouncement(interaction, {
      commandName: 'annonceserveur',
      mentionType: 'everyone',
      title: 'Annonce Serveur',
      emoji: '📢',
      color: 0x5865f2
    });
  }
};
