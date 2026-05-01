const { SlashCommandBuilder } = require('discord.js');
const { findTicketByChannelId } = require('../utils/ticketStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('renameticket')
    .setDescription('Renomme le ticket')
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Nouveau nom du ticket')
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

    const name = interaction.options.getString('nom')
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .slice(0, 80);

    await interaction.channel.setName(name);

    await interaction.reply({
      content: `✅ Ticket renommé en **${name}**.`,
      ephemeral: true
    });
  }
};