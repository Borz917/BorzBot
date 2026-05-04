const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { unlockServer } = require('../utils/raidActions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidunlock')
    .setDescription('Déverrouille les salons publics du serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidunlock')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const result = await unlockServer(
      interaction.guild,
      `Déverrouillage lancé par ${interaction.user.tag}`
    );

    await interaction.editReply({
      content:
        `🔓 Serveur déverrouillé.\n` +
        `**Salons déverrouillés :** ${result.unlocked.length}\n` +
        `**Échecs :** ${result.failed.length}`
    });
  }
};