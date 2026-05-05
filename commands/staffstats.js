const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { getStaffStats } = require('../utils/staffStatsStore');

function formatDate(dateString) {
  if (!dateString) return 'Aucune action enregistrée';

  const timestamp = Math.floor(new Date(dateString).getTime() / 1000);
  return `<t:${timestamp}:F> — <t:${timestamp}:R>`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staffstats')
    .setDescription('Voir les statistiques d’un staff')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Staff à vérifier, vide = toi')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'staffstats')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/staffstats`.',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('membre') || interaction.user;
    const stats = getStaffStats(interaction.guild.id, target.id);

    const embed = new EmbedBuilder()
      .setTitle('📊 Statistiques Staff')
      .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor(0x5865f2)
      .setDescription(`**Staff :** ${target}`)
      .addFields(
        {
          name: '⚠️ Modération',
          value:
            `**Warns :** ${stats.warns || 0}\n` +
            `**Mutes :** ${stats.mutes || 0}\n` +
            `**Bans :** ${stats.bans || 0}\n` +
            `**Kicks :** ${stats.kicks || 0}`,
          inline: true
        },
        {
          name: '🎫 Tickets',
          value:
            `**Tickets pris :** ${stats.ticketClaims || 0}\n` +
            `**Tickets fermés :** ${stats.ticketCloses || 0}`,
          inline: true
        },
        {
          name: '📌 Total',
          value:
            `**Actions totales :** ${stats.total || 0}\n` +
            `**Dernière action :** ${formatDate(stats.lastActionAt)}`,
          inline: false
        }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};