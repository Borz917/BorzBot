const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { findTicketByChannelId } = require('../utils/ticketStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addticketmember')
    .setDescription('Ajoute un membre au ticket')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Membre à ajouter')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ticket = findTicketByChannelId(interaction.channel.id);

    if (!ticket) {
      return interaction.reply({
        content: '❌ Ce salon n’est pas un ticket.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');

    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
      AttachFiles: true
    });

    await interaction.reply({
      content: `✅ ${user} a été ajouté au ticket.`,
      ephemeral: true
    });
  }
};