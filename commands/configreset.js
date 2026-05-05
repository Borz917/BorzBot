const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { resetServerConfig } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configreset')
    .setDescription('Réinitialiser toute la configuration BorzBot du serveur')
    .addStringOption(option =>
      option
        .setName('confirmation')
        .setDescription('Écris RESET pour confirmer')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configreset')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/configreset`.',
        ephemeral: true
      });
    }

    const confirmation = interaction.options.getString('confirmation');

    if (confirmation !== 'RESET') {
      return interaction.reply({
        content: '❌ Confirmation invalide. Tu dois écrire exactement `RESET`.',
        ephemeral: true
      });
    }

    resetServerConfig(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setTitle('🧹 Configuration réinitialisée')
      .setDescription(
        `Toute la configuration BorzBot de ce serveur a été réinitialisée.\n\n` +
        `Refais ensuite :\n` +
        `\`/setupbot\`\n` +
        `\`/configstaffrole\`\n` +
        `\`/confignotifrole\`\n` +
        `\`/configticketcategory\``
      )
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};