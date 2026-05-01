const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { resetUserInvites } = require('../utils/inviteStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetinvites')
    .setDescription('Reset les invitations d’un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à reset')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'resetinvites')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');

    resetUserInvites(interaction.guild.id, user.id);

    await interaction.reply({
      content: `✅ Invitations reset pour ${user}.`,
      ephemeral: true
    });
  }
};