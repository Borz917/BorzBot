const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const { findTicketByChannelId } = require('../../utils/ticketStore');
const sendTicketLog = require('../../utils/sendTicketLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addticketmember')
    .setDescription('Ajouter un membre au ticket actuel')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à ajouter au ticket')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison de l’ajout')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'addticketmember')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/addticketmember`.',
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

    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
      AttachFiles: true
    });

    await sendTicketLog(
      interaction.guild,
      ticketData.subjectId,
      '➕ Membre ajouté au ticket',
      `**Ticket :** ${interaction.channel}\n` +
      `**Utilisateur du ticket :** <@${ticketData.userId}>\n` +
      `**Membre ajouté :** ${user}\n` +
      `**Staff :** ${interaction.user}\n` +
      `**Raison :** ${reason}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('➕ Membre ajouté')
      .setDescription(
        `${user} a été ajouté au ticket.\n\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};