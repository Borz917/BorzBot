const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { findTicketByChannelId } = require('../utils/ticketStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeticketmember')
    .setDescription('Retire un membre du ticket actuel')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à retirer du ticket')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      if (!hasPermission(interaction.member, 'removeticketmember')) {
        return interaction.reply({
          content: '❌ Tu n’as pas la permission d’utiliser /removeticketmember.',
          ephemeral: true
        });
      }

      const ticket = findTicketByChannelId(interaction.channel.id);

      if (!ticket) {
        return interaction.reply({
          content: '❌ Ce salon n’est pas un ticket.',
          ephemeral: true
        });
      }

      const user = interaction.options.getUser('membre');

      if (user.id === ticket.userId) {
        return interaction.reply({
          content: '❌ Tu ne peux pas retirer la personne qui a ouvert le ticket.',
          ephemeral: true
        });
      }

      await interaction.deferReply({ ephemeral: true });

      await interaction.channel.permissionOverwrites.delete(user.id).catch(() => null);

      await interaction.editReply({
        content: `✅ ${user} a été retiré du ticket.`
      });
    } catch (error) {
      console.error('❌ Erreur removeticketmember :', error);

      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({
          content: '❌ Une erreur est survenue pendant le retrait du membre.'
        }).catch(() => null);
      }

      return interaction.reply({
        content: '❌ Une erreur est survenue pendant le retrait du membre.',
        ephemeral: true
      }).catch(() => null);
    }
  }
};