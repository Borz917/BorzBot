const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const { getUserRank } = require('../../utils/duelStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Voir ton rank duel ou celui d’un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à vérifier')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'rank')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/rank`.',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('membre') || interaction.user;
    const rank = getUserRank(interaction.guild.id, target.id);

    const totalGames = (rank.wins || 0) + (rank.losses || 0);
    const winrate = totalGames > 0
      ? Math.round(((rank.wins || 0) / totalGames) * 100)
      : 0;

    const embed = new EmbedBuilder()
      .setTitle('🏆 Rank Duel')
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `**Membre :** ${target}\n` +
        `**Points :** ${rank.points ?? 1000}\n` +
        `**Victoires :** ${rank.wins || 0}\n` +
        `**Défaites :** ${rank.losses || 0}\n` +
        `**Matchs joués :** ${totalGames}\n` +
        `**Winrate :** ${winrate}%`
      )
      .setColor(0xfaa61a)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};