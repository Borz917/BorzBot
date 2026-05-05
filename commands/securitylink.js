const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');
const { setSecurityLink, getServerConfig } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('securitylink')
    .setDescription('Configurer l’anti-link')
    .addBooleanOption(option =>
      option
        .setName('enabled')
        .setDescription('Activer ou désactiver l’anti-link')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('delete_message')
        .setDescription('Supprimer les liens interdits ?')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('timeout_minutes')
        .setDescription('Durée du timeout en minutes')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10080)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'securitylink')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/securitylink`.',
        ephemeral: true
      });
    }

    const enabled = interaction.options.getBoolean('enabled');
    const deleteMessage = interaction.options.getBoolean('delete_message');
    const timeoutMinutes = interaction.options.getInteger('timeout_minutes');

    if (enabled === null && deleteMessage === null && timeoutMinutes === null) {
      return interaction.reply({
        content:
          '❌ Tu dois modifier au moins une option.\n' +
          'Exemple : `/securitylink enabled:true delete_message:true timeout_minutes:5`',
        ephemeral: true
      });
    }

    const options = {};

    if (enabled !== null) options.enabled = enabled;
    if (deleteMessage !== null) options.deleteMessage = deleteMessage;
    if (timeoutMinutes !== null) options.timeoutMs = timeoutMinutes * 60 * 1000;

    setSecurityLink(interaction.guild.id, options);

    const config = getServerConfig(interaction.guild.id);
    const antiLink = config.security.antiLink;

    const allowedDomains =
      Array.isArray(antiLink.allowedDomains) && antiLink.allowedDomains.length > 0
        ? antiLink.allowedDomains.map(domain => `\`${domain}\``).join(', ')
        : 'Aucun';

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🔗 Anti-link configuré',
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Statut :** ${antiLink.enabled ? 'Activé' : 'Désactivé'}\n` +
      `**Supprimer message :** ${antiLink.deleteMessage ? 'Oui' : 'Non'}\n` +
      `**Timeout :** ${antiLink.timeoutMs / 60000} min\n` +
      `**Domaines autorisés :** ${allowedDomains}`,
      0x5865f2
    );

    const embed = new EmbedBuilder()
      .setTitle('🔗 Anti-link configuré')
      .setDescription(
        `**Statut :** ${antiLink.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
        `**Supprimer message :** ${antiLink.deleteMessage ? 'Oui' : 'Non'}\n` +
        `**Timeout :** ${antiLink.timeoutMs / 60000} min\n` +
        `**Domaines autorisés :** ${allowedDomains}`
      )
      .setColor(0x5865f2)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};