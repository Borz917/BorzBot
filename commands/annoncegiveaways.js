const { SlashCommandBuilder } = require('discord.js');
const sendAnnouncement = require('../utils/sendAnnouncement');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annoncegiveaways')
    .setDescription('Envoyer une annonce pour le rôle Notification Giveaways')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message de l’annonce')
        .setRequired(true)
    ),

  async execute(interaction) {
    await sendAnnouncement(interaction, {
      commandName: 'annoncegiveaways',
      mentionType: 'role',
      roleName: 'Notification Giveaways',
      title: 'Annonce Giveaways',
      emoji: '🎁',
      color: 0xfaa61a
    });
  }
};
