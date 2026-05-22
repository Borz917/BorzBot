const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const { getStaffTop } = require('../../utils/staffStatsStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stafftop')
    .setDescription('Voir le classement des staffs les plus actifs')
    .addIntegerOption(option =>
      option
        .setName('limite')
        .setDescription('Nombre de staffs à afficher')
        .setRequired(false)
        .setMinValue(3)
        .setMaxValue(20)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'stafftop')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/stafftop`.',
        ephemeral: true
      });
    }

    const limit = interaction.options.getInteger('limite') || 10;
    const top = getStaffTop(interaction.guild.id, limit);

    if (!top.length) {
      return interaction.reply({
        content: '📊 Aucune statistique staff enregistrée pour le moment.',
        ephemeral: true
      });
    }

    const description = top
      .map((staff, index) => {
        const medal =
          index === 0 ? '🥇' :
          index === 1 ? '🥈' :
          index === 2 ? '🥉' :
          `#${index + 1}`;

        return (
          `${medal} <@${staff.userId}> — **${staff.total || 0} action(s)**\n` +
          `Warns: ${staff.warns || 0} | Mutes: ${staff.mutes || 0} | Bans: ${staff.bans || 0} | Kicks: ${staff.kicks || 0} | Tickets: ${(staff.ticketClaims || 0) + (staff.ticketCloses || 0)}`
        );
      })
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Top Staff Actif')
      .setDescription(description)
      .setColor(0xfaa61a)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};