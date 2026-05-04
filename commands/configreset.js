const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { resetServerConfig } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configreset')
    .setDescription('Réinitialise la configuration BorzBot de ce serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configreset')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    resetServerConfig(interaction.guild.id);

    await interaction.reply({
      content: '✅ Configuration du serveur réinitialisée.',
      ephemeral: true
    });
  }
};