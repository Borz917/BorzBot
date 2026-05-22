const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const { findTicketByChannelId } = require('../../utils/ticketStore');
const sendTicketLog = require('../../utils/sendTicketLog');

function cleanChannelName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('renameticket')
    .setDescription('Renommer le ticket actuel')
    .addStringOption(option =>
      option
        .setName('nom')
        .setDescription('Nouveau nom du ticket')
        .setRequired(true)
        .setMaxLength(80)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du renommage')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'renameticket')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/renameticket`.',
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
        content: '❌ Je n’ai pas la permission de renommer ce salon.',
        ephemeral: true
      });
    }

    const rawName = interaction.options.getString('nom');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
    const newName = cleanChannelName(rawName);

    if (!newName) {
      return interaction.reply({
        content: '❌ Nom invalide.',
        ephemeral: true
      });
    }

    const oldName = interaction.channel.name;

    await interaction.channel.setName(newName, `${reason} | Par ${interaction.user.tag}`);

    await sendTicketLog(
      interaction.guild,
      ticketData.subjectId,
      '✏️ Ticket renommé',
      `**Utilisateur du ticket :** <@${ticketData.userId}>\n` +
      `**Ancien nom :** #${oldName}\n` +
      `**Nouveau nom :** #${newName}\n` +
      `**Staff :** ${interaction.user}\n` +
      `**Raison :** ${reason}`,
      0x5865f2
    );

    const embed = new EmbedBuilder()
      .setTitle('✏️ Ticket renommé')
      .setDescription(
        `**Ancien nom :** #${oldName}\n` +
        `**Nouveau nom :** #${newName}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0x5865f2)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};