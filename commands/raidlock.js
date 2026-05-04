const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { lockServer } = require('../utils/raidActions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidlock')
    .setDescription('Verrouille les salons publics du serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidlock')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const result = await lockServer(
      interaction.guild,
      `Lockdown lancé par ${interaction.user.tag}`
    );

    await interaction.editReply({
      content:
        `🔒 Serveur verrouillé.\n` +
        `**Salons verrouillés :** ${result.locked.length}\n` +
        `**Échecs :** ${result.failed.length}`
    });
  }
};