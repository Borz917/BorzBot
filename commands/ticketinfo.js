const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { findTicketByChannelId } = require('../utils/ticketStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketinfo')
    .setDescription('Affiche les infos du ticket'),

  async execute(interaction) {
    const ticket = findTicketByChannelId(interaction.channel.id);

    if (!ticket) {
      return interaction.reply({
        content: '❌ Ce salon n’est pas un ticket.',
        ephemeral: true
      });
    }

    const claimed =
      Array.isArray(ticket.claimedBy) && ticket.claimedBy.length > 0
        ? ticket.claimedBy.map(id => `<@${id}>`).join(', ')
        : 'Personne';

    const embed = new EmbedBuilder()
      .setTitle('🎫 Informations du ticket')
      .setColor(0x5865f2)
      .addFields(
        { name: 'Utilisateur', value: `<@${ticket.userId}>`, inline: true },
        { name: 'Sujet', value: ticket.subject || 'Inconnu', inline: true },
        { name: 'Staff en charge', value: claimed },
        { name: 'Salon', value: `${interaction.channel}` }
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};