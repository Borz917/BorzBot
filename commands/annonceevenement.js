const { SlashCommandBuilder } = require('discord.js');
const sendAnnouncement = require('../utils/sendAnnouncement');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annonceevenement')
    .setDescription('Envoyer une annonce pour le rôle Notification Événement')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message de l’annonce')
        .setRequired(true)
    ),

  async execute(interaction) {
    await sendAnnouncement(interaction, {
      commandName: 'annonceevenement',
      mentionType: 'role',
      roleName: 'Notification Événement',
      title: 'Annonce Événement',
      emoji: '🎉',
      color: 0x9b59b6
    });
  }
};
