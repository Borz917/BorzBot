const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

const SUPPORT_SERVER =
  process.env.SUPPORT_SERVER ||
  'https://discord.gg/PwrM5KvMkx';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Obtenir le serveur support du bot'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'support')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/support`.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🆘 Support BorzBot')
      .setDescription(
        `Besoin d’aide avec BorzBot ?\n\n` +
        `[📩 Rejoindre le support](${SUPPORT_SERVER})`
      )
      .setColor(0x5865f2)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};