const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');
const { setSecuritySpam, getServerConfig } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('securityspam')
    .setDescription('Configurer l’anti-spam')
    .addBooleanOption(option =>
      option
        .setName('enabled')
        .setDescription('Activer ou désactiver l’anti-spam')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('max_messages')
        .setDescription('Nombre maximum de messages autorisés')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(30)
    )
    .addIntegerOption(option =>
      option
        .setName('interval_secondes')
        .setDescription('Intervalle en secondes')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(120)
    )
    .addIntegerOption(option =>
      option
        .setName('timeout_minutes')
        .setDescription('Durée du timeout en minutes')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10080)
    )
    .addBooleanOption(option =>
      option
        .setName('delete_messages')
        .setDescription('Supprimer les messages spam ?')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'securityspam')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/securityspam`.',
        ephemeral: true
      });
    }

    const enabled = interaction.options.getBoolean('enabled');
    const maxMessages = interaction.options.getInteger('max_messages');
    const intervalSeconds = interaction.options.getInteger('interval_secondes');
    const timeoutMinutes = interaction.options.getInteger('timeout_minutes');
    const deleteMessages = interaction.options.getBoolean('delete_messages');

    if (
      enabled === null &&
      maxMessages === null &&
      intervalSeconds === null &&
      timeoutMinutes === null &&
      deleteMessages === null
    ) {
      return interaction.reply({
        content:
          '❌ Tu dois modifier au moins une option.\n' +
          'Exemple : `/securityspam enabled:true max_messages:5 interval_secondes:7 timeout_minutes:10`',
        ephemeral: true
      });
    }

    const options = {};

    if (enabled !== null) options.enabled = enabled;
    if (maxMessages !== null) options.maxMessages = maxMessages;
    if (intervalSeconds !== null) options.intervalMs = intervalSeconds * 1000;
    if (timeoutMinutes !== null) options.timeoutMs = timeoutMinutes * 60 * 1000;
    if (deleteMessages !== null) options.deleteMessages = deleteMessages;

    setSecuritySpam(interaction.guild.id, options);

    const config = getServerConfig(interaction.guild.id);
    const antiSpam = config.security.antiSpam;

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🛡️ Anti-spam configuré',
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Statut :** ${antiSpam.enabled ? 'Activé' : 'Désactivé'}\n` +
      `**Max messages :** ${antiSpam.maxMessages}\n` +
      `**Intervalle :** ${antiSpam.intervalMs / 1000}s\n` +
      `**Timeout :** ${antiSpam.timeoutMs / 60000} min\n` +
      `**Supprimer messages :** ${antiSpam.deleteMessages ? 'Oui' : 'Non'}`,
      0x5865f2
    );

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Anti-spam configuré')
      .setDescription(
        `**Statut :** ${antiSpam.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
        `**Max messages :** ${antiSpam.maxMessages}\n` +
        `**Intervalle :** ${antiSpam.intervalMs / 1000}s\n` +
        `**Timeout :** ${antiSpam.timeoutMs / 60000} min\n` +
        `**Supprimer messages :** ${antiSpam.deleteMessages ? 'Oui' : 'Non'}`
      )
      .setColor(0x5865f2)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};