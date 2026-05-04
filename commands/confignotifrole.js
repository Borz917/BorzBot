const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { setNotifRole } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('confignotifrole')
    .setDescription('Configure les rôles notifications')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type de notification')
        .setRequired(true)
        .addChoices(
          { name: 'Illégal', value: 'illegal' },
          { name: 'Légal', value: 'legal' },
          { name: 'Giveaways', value: 'giveaways' },
          { name: 'Événement', value: 'evenement' }
        )
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Rôle notification')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'confignotifrole')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const type = interaction.options.getString('type');
    const role = interaction.options.getRole('role');

    setNotifRole(interaction.guild.id, type, role.id);

    await interaction.reply({
      content: `✅ Rôle notification **${type}** configuré : ${role}`,
      ephemeral: true
    });
  }
};