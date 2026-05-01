const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { getAllRankings } = require('../utils/duelStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Affiche le leaderboard ranked'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'leaderboard')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const rankings = getAllRankings()
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    if (rankings.length === 0) {
      return interaction.reply('🏆 Aucun joueur classé pour le moment.');
    }

    const text = rankings
      .map((entry, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        return `${medal} <@${entry.userId}> — **${entry.points} pts**`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Leaderboard Ranked 1vs1')
      .setDescription(text)
      .setColor(0xfaa61a)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};