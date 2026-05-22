const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Faire un pile ou face'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'coinflip')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/coinflip`.',
        ephemeral: true
      });
    }

    const result = Math.random() < 0.5 ? 'Pile' : 'Face';
    const emoji = result === 'Pile' ? '🪙' : '🔄';

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Pile ou face`)
      .setDescription(`Résultat : **${result}**`)
      .setColor(0xfaa61a)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};