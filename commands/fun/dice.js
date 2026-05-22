const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Lancer un dé')
    .addIntegerOption(option =>
      option
        .setName('faces')
        .setDescription('Nombre de faces du dé')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(1000)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'dice')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/dice`.',
        ephemeral: true
      });
    }

    const faces = interaction.options.getInteger('faces') || 6;
    const result = Math.floor(Math.random() * faces) + 1;

    const embed = new EmbedBuilder()
      .setTitle('🎲 Lancer de dé')
      .setDescription(
        `**Dé :** 1 à ${faces}\n` +
        `**Résultat :** ${result}`
      )
      .setColor(0x5865f2)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};