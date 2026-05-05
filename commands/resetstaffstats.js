const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

const {
  getStaffStats,
  resetStaffStats,
  resetGuildStaffStats
} = require('../utils/staffStatsStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetstaffstats')
    .setDescription('Reset les statistiques staff')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Staff à reset, vide = tout le serveur')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('confirmation')
        .setDescription('Écris RESET si tu veux reset tout le serveur')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du reset')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'resetstaffstats')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/resetstaffstats`.',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('membre');
    const confirmation = interaction.options.getString('confirmation');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (target) {
      const oldStats = getStaffStats(interaction.guild.id, target.id);
      resetStaffStats(interaction.guild.id, target.id);

      await sendDiscordLog(
        interaction.guild,
        'moderation-logs',
        '📊 Stats staff reset',
        `**Staff :** ${target.tag}\n` +
        `**Ancien total :** ${oldStats.total || 0}\n` +
        `**Reset par :** ${interaction.user.tag}\n` +
        `**Raison :** ${reason}`,
        0xed4245
      );

      const embed = new EmbedBuilder()
        .setTitle('📊 Stats staff reset')
        .setDescription(
          `Les statistiques de ${target} ont été reset.\n\n` +
          `**Ancien total :** ${oldStats.total || 0}\n` +
          `**Raison :** ${reason}`
        )
        .setColor(0xed4245)
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    if (confirmation !== 'RESET') {
      return interaction.reply({
        content: '❌ Pour reset toutes les stats staff du serveur, écris `RESET` dans l’option confirmation.',
        ephemeral: true
      });
    }

    resetGuildStaffStats(interaction.guild.id);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '📊 Toutes les stats staff reset',
      `**Serveur :** ${interaction.guild.name}\n` +
      `**Reset par :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('📊 Toutes les stats staff reset')
      .setDescription(
        `Toutes les statistiques staff du serveur ont été reset.\n\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};