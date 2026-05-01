const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { removeWarn, getWarns } = require('../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Retire un avertissement')
    .addUserOption(option =>
      option.setName('membre').setDescription('Le membre concerné').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('numero').setDescription('Numéro du warn à retirer').setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'unwarn')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /unwarn.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const number = interaction.options.getInteger('numero');

    const success = removeWarn(user.id, number - 1);

    if (!success) {
      return interaction.reply({
        content: '❌ Warn introuvable.',
        ephemeral: true
      });
    }

    const remaining = getWarns(user.id).length;

    await interaction.reply(`✅ Le warn n°${number} de ${user.tag} a été retiré.\n**Warns restants :** ${remaining}`);
  }
};