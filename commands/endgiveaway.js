const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { endGiveaway } = require('../utils/giveawayStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('endgiveaway')
    .setDescription('Supprimer un giveaway en cours')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('ID du giveaway')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'endgiveaway')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const giveawayId = interaction.options.getString('id');

    const success = endGiveaway(interaction.guild.id, giveawayId);

    if (!success) {
      return interaction.reply({
        content: '❌ Giveaway introuvable.',
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `✅ Giveaway \`${giveawayId}\` supprimé.`,
      ephemeral: true
    });
  }
};