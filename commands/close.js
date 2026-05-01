const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { findTicketByChannelId, deleteTicket } = require('../utils/ticketStore');
const sendTicketLog = require('../utils/sendTicketLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Ferme le ticket actuel'),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
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

    deleteTicket(ticketData.userId);

    await sendTicketLog(
      interaction.guild,
      '🔒 Ticket fermé',
      `**Utilisateur :** <@${ticketData.userId}>\n**Sujet :** ${ticketData.subject}\n**Fermé par :** ${interaction.user}`,
      0xed4245
    );

    await interaction.reply('🔒 Fermeture du ticket...');
    setTimeout(async () => {
      await interaction.channel.delete().catch(() => null);
    }, 1500);
  }
};