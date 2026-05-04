const { SlashCommandBuilder } = require('discord.js');
const sendAnnouncement = require('../utils/sendAnnouncement');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annonceillegal')
    .setDescription('Envoyer une annonce pour le rôle Notification Illégal')
    .addStringOption(option =>
      option.setName('message').setDescription('Message de l’annonce').setRequired(true)
    ),

  async execute(interaction) {
    await sendAnnouncement(interaction, {
      commandName: 'annonceillegal',
      mentionType: 'role',
      notifType: 'illegal',
      title: 'Annonce Illégal',
      emoji: '🛡️',
      color: 0xed4245
    });
  }
};