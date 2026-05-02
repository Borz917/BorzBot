const { SlashCommandBuilder } = require('discord.js');
const sendAnnouncement = require('../utils/sendAnnouncement');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annoncelegal')
    .setDescription('Envoyer une annonce pour le rôle Notification Légal')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message de l’annonce')
        .setRequired(true)
    ),

  async execute(interaction) {
    await sendAnnouncement(interaction, {
      commandName: 'annoncelegal',
      mentionType: 'role',
      roleName: 'Notification Légal',
      title: 'Annonce Légal',
      emoji: '⚖️',
      color: 0x57f287
    });
  }
};
