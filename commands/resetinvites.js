const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

const {
  getUserInvites,
  resetUserInvites,
  resetGuildInvites
} = require('../utils/inviteStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetinvites')
    .setDescription('Reset les invitations')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à reset, vide = tout le serveur')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du reset')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'resetinvites')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/resetinvites`.',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (target) {
      const oldData = getUserInvites(interaction.guild.id, target.id);
      resetUserInvites(interaction.guild.id, target.id);

      await sendDiscordLog(
        interaction.guild,
        'moderation-logs',
        '🧹 Invitations reset',
        `**Membre :** ${target.tag}\n` +
        `**Ancien total :** ${oldData.total || 0}\n` +
        `**Modérateur :** ${interaction.user.tag}\n` +
        `**Raison :** ${reason}`,
        0xed4245
      );

      const embed = new EmbedBuilder()
        .setTitle('🧹 Invitations reset')
        .setDescription(
          `**Membre :** ${target.tag}\n` +
          `**Ancien total :** ${oldData.total || 0}\n` +
          `**Raison :** ${reason}`
        )
        .setColor(0xed4245)
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    resetGuildInvites(interaction.guild.id);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🧹 Invitations serveur reset',
      `**Serveur :** ${interaction.guild.name}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('🧹 Invitations serveur reset')
      .setDescription(
        `Toutes les invitations enregistrées du serveur ont été reset.\n\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};