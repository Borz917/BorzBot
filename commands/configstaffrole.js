const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { setStaffRole } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configstaffrole')
    .setDescription('Configure le rôle staff du serveur')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Rôle staff')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configstaffrole')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const role = interaction.options.getRole('role');

    setStaffRole(interaction.guild.id, role.id);

    await interaction.reply({
      content: `✅ Rôle staff configuré : ${role}`,
      ephemeral: true
    });
  }
};