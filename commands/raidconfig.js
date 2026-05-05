const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

const {
  getServerConfig,
  setRaidConfig
} = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidconfig')
    .setDescription('Configurer l’anti-raid')
    .addBooleanOption(option =>
      option
        .setName('enabled')
        .setDescription('Activer ou désactiver l’anti-raid')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('joins_limit')
        .setDescription('Nombre maximum d’arrivées autorisées')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(100)
    )
    .addIntegerOption(option =>
      option
        .setName('interval_secondes')
        .setDescription('Intervalle en secondes')
        .setRequired(false)
        .setMinValue(5)
        .setMaxValue(600)
    )
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Action à effectuer en cas de raid')
        .setRequired(false)
        .addChoices(
          { name: 'Alerter seulement', value: 'alert' },
          { name: 'Verrouiller le serveur', value: 'lock' },
          { name: 'Kick les nouveaux arrivants', value: 'kick' }
        )
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidconfig')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/raidconfig`.',
        ephemeral: true
      });
    }

    const enabled = interaction.options.getBoolean('enabled');
    const joinsLimit = interaction.options.getInteger('joins_limit');
    const intervalSeconds = interaction.options.getInteger('interval_secondes');
    const action = interaction.options.getString('action');

    if (
      enabled === null &&
      joinsLimit === null &&
      intervalSeconds === null &&
      action === null
    ) {
      return interaction.reply({
        content:
          '❌ Tu dois modifier au moins une option.\n' +
          'Exemple : `/raidconfig enabled:true joins_limit:5 interval_secondes:60 action:lock`',
        ephemeral: true
      });
    }

    const options = {};

    if (enabled !== null) options.enabled = enabled;
    if (joinsLimit !== null) options.joinsLimit = joinsLimit;
    if (intervalSeconds !== null) options.intervalMs = intervalSeconds * 1000;
    if (action !== null) options.action = action;

    setRaidConfig(interaction.guild.id, options);

    const config = getServerConfig(interaction.guild.id);
    const raid = config.raid;

    await sendDiscordLog(
      interaction.guild,
      'raid-logs',
      '🚨 Anti-raid configuré',
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Statut :** ${raid.enabled ? 'Activé' : 'Désactivé'}\n` +
      `**Limite joins :** ${raid.joinsLimit}\n` +
      `**Intervalle :** ${raid.intervalMs / 1000}s\n` +
      `**Action :** ${raid.action}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('🚨 Anti-raid configuré')
      .setDescription(
        `**Statut :** ${raid.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
        `**Limite joins :** ${raid.joinsLimit}\n` +
        `**Intervalle :** ${raid.intervalMs / 1000}s\n` +
        `**Action :** \`${raid.action}\``
      )
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};