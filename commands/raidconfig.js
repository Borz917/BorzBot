const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { setRaidConfig } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidconfig')
    .setDescription('Configurer l’anti-raid')
    .addBooleanOption(option =>
      option
        .setName('active')
        .setDescription('Activer ou désactiver')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('joins')
        .setDescription('Nombre de joins max')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('intervalle')
        .setDescription('Intervalle en secondes')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Action en cas de raid')
        .setRequired(false)
        .addChoices(
          { name: 'Alerte uniquement', value: 'alert' },
          { name: 'Lockdown serveur', value: 'lockdown' },
          { name: 'Kick nouveaux membres', value: 'kick' }
        )
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidconfig')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const active = interaction.options.getBoolean('active');
    const joins = interaction.options.getInteger('joins');
    const intervalle = interaction.options.getInteger('intervalle');
    const action = interaction.options.getString('action');

    const options = {
      enabled: active
    };

    if (joins !== null) {
      if (joins < 2 || joins > 50) {
        return interaction.reply({
          content: '❌ Le nombre de joins doit être entre 2 et 50.',
          ephemeral: true
        });
      }

      options.joinsLimit = joins;
    }

    if (intervalle !== null) {
      if (intervalle < 5 || intervalle > 600) {
        return interaction.reply({
          content: '❌ L’intervalle doit être entre 5 et 600 secondes.',
          ephemeral: true
        });
      }

      options.intervalMs = intervalle * 1000;
    }

    if (action) {
      options.action = action;
    }

    setRaidConfig(interaction.guild.id, options);

    await interaction.reply({
      content:
        `✅ Anti-raid mis à jour.\n` +
        `**Activé :** ${active ? 'Oui' : 'Non'}\n` +
        `${joins !== null ? `**Joins :** ${joins}\n` : ''}` +
        `${intervalle !== null ? `**Intervalle :** ${intervalle}s\n` : ''}` +
        `${action ? `**Action :** ${action}` : ''}`,
      ephemeral: true
    });
  }
};