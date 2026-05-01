const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime des messages')
    .addIntegerOption(option =>
      option.setName('nombre').setDescription('Nombre de messages à supprimer').setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'clear')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /clear.',
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger('nombre');

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: '❌ Choisis un nombre entre 1 et 100.',
        ephemeral: true
      });
    }

    await interaction.channel.bulkDelete(amount, true);

    await interaction.reply({
      content: `🧹 ${amount} messages supprimés.`,
      ephemeral: true
    });
  }
};