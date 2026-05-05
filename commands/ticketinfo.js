const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { findTicketByChannelId } = require('../utils/ticketStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketinfo')
    .setDescription('Afficher les informations du ticket actuel'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'ticketinfo')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/ticketinfo`.',
        ephemeral: true
      });
    }

    const ticketData = findTicketByChannelId(interaction.channel.id);

    if (!ticketData) {
      return interaction.reply({
        content: '❌ Ce salon n’est pas un ticket.',
        ephemeral: true
      });
    }

    const claimedBy =
      Array.isArray(ticketData.claimedBy) && ticketData.claimedBy.length > 0
        ? ticketData.claimedBy.map(id => `<@${id}>`).join(', ')
        : 'Personne';

    const embed = new EmbedBuilder()
      .setTitle('🎫 Informations du ticket')
      .setColor(0x5865f2)
      .addFields(
        {
          name: 'Utilisateur',
          value: `<@${ticketData.userId}>`,
          inline: true
        },
        {
          name: 'Sujet',
          value: ticketData.subject || 'Inconnu',
          inline: true
        },
        {
          name: 'Sujet ID',
          value: `\`${ticketData.subjectId || 'unknown'}\``,
          inline: true
        },
        {
          name: 'Salon',
          value: `${interaction.channel}`,
          inline: true
        },
        {
          name: 'Pris en charge par',
          value: claimedBy,
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