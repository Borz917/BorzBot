const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const { getLeaderboard } = require('../../utils/duelStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Voir le classement ranked duel'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'leaderboard')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/leaderboard`.',
        ephemeral: true
      });
    }

    const leaderboard = getLeaderboard(interaction.guild.id).slice(0, 10);

    if (!leaderboard.length) {
      return interaction.reply({
        content: '🏆 Aucun joueur classé pour le moment.',
        ephemeral: true
      });
    }

    const text = leaderboard
      .map((player, index) => {
        const medal =
          index === 0 ? '🥇' :
          index === 1 ? '🥈' :
          index === 2 ? '🥉' :
          `#${index + 1}`;

        const totalGames = player.wins + player.losses;
        const winrate = totalGames > 0
          ? Math.round((player.wins / totalGames) * 100)
          : 0;

        return (
          `${medal} <@${player.userId}> — **${player.points} pts**\n` +
          `V: ${player.wins} | D: ${player.losses} | WR: ${winrate}%`
        );
      })
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Leaderboard Duel Ranked')
      .setDescription(text)
      .setColor(0xfaa61a)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};