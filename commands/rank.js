const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { getRanking } = require('../utils/duelStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Affiche ton classement ranked 1vs1')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Membre à vérifier')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'rank')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre') || interaction.user;
    const points = getRanking(user.id);

    const embed = new EmbedBuilder()
      .setTitle('🏆 Classement Ranked')
      .setDescription(
        `**Joueur :** ${user}\n` +
        `**Points :** ${points}`
      )
      .setColor(0xfaa61a)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};