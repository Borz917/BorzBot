const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { resetRank } = require('../utils/duelStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetrank')
    .setDescription('Reset le rank d’un joueur')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Membre à reset')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'resetrank')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');

    resetRank(user.id);

    await interaction.reply({
      content: `✅ Rank reset pour ${user} à **1000 points**.`,
      ephemeral: true
    });
  }
};