const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { findTicketByChannelId } = require('../utils/ticketStore');
const sendTicketLog = require('../utils/sendTicketLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeticketmember')
    .setDescription('Retirer un membre du ticket actuel')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à retirer du ticket')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du retrait')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'removeticketmember')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/removeticketmember`.',
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

    if (!interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission de gérer ce salon.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (user.id === ticketData.userId) {
      return interaction.reply({
        content: '❌ Tu ne peux pas retirer le créateur du ticket avec cette commande.',
        ephemeral: true
      });
    }

    await interaction.channel.permissionOverwrites.delete(user.id).catch(async () => {
      await interaction.channel.permissionOverwrites.edit(user.id, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
        AttachFiles: false
      });
    });

    await sendTicketLog(
      interaction.guild,
      ticketData.subjectId,
      '➖ Membre retiré du ticket',
      `**Ticket :** ${interaction.channel}\n` +
      `**Utilisateur du ticket :** <@${ticketData.userId}>\n` +
      `**Membre retiré :** ${user}\n` +
      `**Staff :** ${interaction.user}\n` +
      `**Raison :** ${reason}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('➖ Membre retiré')
      .setDescription(
        `${user} a été retiré du ticket.\n\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};