const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const {
  findTicketByChannelId,
  deleteTicket,
  deleteTicketByChannelId
} = require('../utils/ticketStore');
const sendTicketLog = require('../utils/sendTicketLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('forceclose')
    .setDescription('Force la fermeture du ticket actuel même s’il est cassé'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'forceclose')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /forceclose.',
        ephemeral: true
      });
    }

    const ticketData = findTicketByChannelId(interaction.channel.id);

    // Cas normal : ticket retrouvé
    if (ticketData) {
      deleteTicket(ticketData.userId);

      await sendTicketLog(
        interaction.guild,
        ticketData.subjectId || 'unknown',
        '🛑 Ticket fermé de force',
        `**Utilisateur :** <@${ticketData.userId}>\n` +
        `**Sujet :** ${ticketData.subject || 'Inconnu'}\n` +
        `**Fermé de force par :** ${interaction.user}\n` +
        `**Salon :** ${interaction.channel}`,
        0xff0000
      );

      await interaction.reply({
        content: '🛑 Fermeture forcée du ticket...'
      });

      setTimeout(async () => {
        await interaction.channel.delete().catch(() => null);
      }, 1500);

      return;
    }

    // Cas cassé : pas retrouvé dans le store
    const removedFromStore = deleteTicketByChannelId(interaction.channel.id);

    await interaction.reply({
      content: removedFromStore
        ? '🛑 Ticket introuvable par userId, mais supprimé du store via channelId. Fermeture...'
        : '🛑 Ticket non trouvé dans le store. Fermeture forcée du salon...'
    });

    await sendTicketLog(
      interaction.guild,
      'unknown',
      '🛑 Salon ticket fermé de force',
      `**Salon :** ${interaction.channel}\n` +
      `**Fermé de force par :** ${interaction.user}\n` +
      `**Statut store :** ${removedFromStore ? 'Entrée supprimée via channelId' : 'Aucune entrée trouvée'}`,
      0xff0000
    );

    setTimeout(async () => {
      await interaction.channel.delete().catch(() => null);
    }, 1500);
  }
};