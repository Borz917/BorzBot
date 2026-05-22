const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const createTranscript = require('../../utils/createTranscript');
const sendTicketLog = require('../../utils/sendTicketLog');

const {
  findTicketByChannelId,
  deleteTicket
} = require('../../utils/ticketStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('forceclose')
    .setDescription('Forcer la fermeture du ticket actuel')
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison de la fermeture forcée')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('transcript')
        .setDescription('Créer un transcript avant suppression ?')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'forceclose')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/forceclose`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les salons`.',
        ephemeral: true
      });
    }

    const ticketData = findTicketByChannelId(interaction.channel.id);

    if (!ticketData) {
      return interaction.reply({
        content: '❌ Ce salon n’est pas enregistré comme ticket.',
        ephemeral: true
      });
    }

    const reason = interaction.options.getString('raison') || 'Fermeture forcée';
    const shouldTranscript = interaction.options.getBoolean('transcript') ?? true;

    await interaction.deferReply({
      ephemeral: true
    });

    let transcript = null;

    if (shouldTranscript) {
      try {
        transcript = await createTranscript(interaction.channel);
      } catch (error) {
        console.error('Erreur transcript forceclose :', error);
      }
    }

    const claimedMentions =
      Array.isArray(ticketData.claimedBy) && ticketData.claimedBy.length > 0
        ? ticketData.claimedBy.map(id => `<@${id}>`).join(', ')
        : 'Personne';

    deleteTicket(ticketData.userId);

    await sendTicketLog(
      interaction.guild,
      ticketData.subjectId,
      '🛑 Ticket fermé de force',
      `**Utilisateur :** <@${ticketData.userId}>\n` +
      `**Sujet :** ${ticketData.subject}\n` +
      `**Pris en charge par :** ${claimedMentions}\n` +
      `**Fermé par :** ${interaction.user}\n` +
      `**Raison :** ${reason}\n` +
      `**Salon :** #${interaction.channel.name}`,
      0xed4245,
      transcript ? [transcript] : []
    );

    const embed = new EmbedBuilder()
      .setTitle('🛑 Ticket fermé de force')
      .setDescription(
        `Le ticket va être supprimé.\n\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xed4245)
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed]
    });

    setTimeout(async () => {
      await interaction.channel.delete().catch(() => null);
    }, 2000);
  }
};