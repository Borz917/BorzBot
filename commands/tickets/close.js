const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionsBitField
} = require('discord.js');

const hasPermission = require('../../utils/hasPermission');
const { findTicketByChannelId } = require('../../utils/ticketStore');
const { getServerConfig } = require('../../utils/serverConfig');
const ticketConfig = require('../../config/ticketConfig');

function getConfiguredStaffRole(guild) {
  const serverConfig = getServerConfig(guild.id);

  let staffRole = null;

  if (serverConfig.staffRoleId) {
    staffRole = guild.roles.cache.get(serverConfig.staffRoleId);
  }

  if (!staffRole) {
    staffRole = guild.roles.cache.find(
      role => role.name === ticketConfig.staffRoleName
    );
  }

  return staffRole;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Fermer le ticket actuel'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'close')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/close`.',
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

    const isOwner = interaction.user.id === ticketData.userId;
    const staffRole = getConfiguredStaffRole(interaction.guild);

    const hasStaffRole =
      staffRole && interaction.member.roles.cache.has(staffRole.id);

    const canManage = interaction.member.permissions.has(
      PermissionsBitField.Flags.ManageChannels
    );

    if (!isOwner && !hasStaffRole && !canManage) {
      return interaction.reply({
        content: '❌ Tu ne peux pas fermer ce ticket.',
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`ticket_close_modal_${interaction.channel.id}`)
      .setTitle('Fermer le ticket');

    const reasonInput = new TextInputBuilder()
      .setCustomId('close_reason')
      .setLabel('Raison de la fermeture')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(500)
      .setPlaceholder('Exemple : problème résolu, demande traitée...');

    const row = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(row);

    return interaction.showModal(modal);
  }
};