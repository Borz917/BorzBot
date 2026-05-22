const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');

const {
  resetUserRank,
  resetGuildRanks
} = require('../../utils/duelStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetrank')
    .setDescription('Reset le rank duel d’un membre ou du serveur')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à reset, vide = tout le serveur')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('confirmation')
        .setDescription('Écris RESET si tu veux reset tout le serveur')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'resetrank')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/resetrank`.',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('membre');
    const confirmation = interaction.options.getString('confirmation');

    if (target) {
      resetUserRank(interaction.guild.id, target.id);

      await sendDiscordLog(
        interaction.guild,
        'moderation-logs',
        '🏆 Rank duel reset',
        `**Membre :** ${target.tag}\n**Modérateur :** ${interaction.user.tag}`,
        0xed4245
      );

      const embed = new EmbedBuilder()
        .setTitle('🏆 Rank reset')
        .setDescription(`Le rank duel de ${target} a été reset.`)
        .setColor(0xed4245)
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    if (confirmation !== 'RESET') {
      return interaction.reply({
        content: '❌ Pour reset tout le serveur, écris `RESET` dans l’option confirmation.',
        ephemeral: true
      });
    }

    resetGuildRanks(interaction.guild.id);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🏆 Tous les ranks duel reset',
      `**Serveur :** ${interaction.guild.name}\n**Modérateur :** ${interaction.user.tag}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('🏆 Tous les ranks reset')
      .setDescription('Tous les ranks duel du serveur ont été reset.')
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};