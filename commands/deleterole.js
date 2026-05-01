const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleterole')
    .setDescription('Supprimer un rôle')
    .addRoleOption(option =>
      option.setName('role').setDescription('Rôle à supprimer').setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'deleterole')) {
      return interaction.reply({ content: '❌ Permission refusée.', ephemeral: true });
    }

    const role = interaction.options.getRole('role');

    await role.delete(`Supprimé par ${interaction.user.tag}`);

    await interaction.reply(`🗑️ Rôle supprimé : ${role.name}`);
  }
};