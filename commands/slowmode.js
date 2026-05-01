const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Change le slowmode du salon')
    .addIntegerOption(option =>
      option
        .setName('secondes')
        .setDescription('Durée en secondes, 0 pour désactiver')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'slowmode')) {
      return interaction.reply({ content: '❌ Tu n’as pas la permission.', ephemeral: true });
    }

    const seconds = interaction.options.getInteger('secondes');

    if (seconds < 0 || seconds > 21600) {
      return interaction.reply({
        content: '❌ Mets une durée entre 0 et 21600 secondes.',
        ephemeral: true
      });
    }

    await interaction.channel.setRateLimitPerUser(seconds);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🐢 Slowmode modifié',
      `**Salon :** ${interaction.channel}\n**Durée :** ${seconds}s\n**Modérateur :** ${interaction.user.tag}`,
      0xfaa61a
    );

    await interaction.reply(
      seconds === 0
        ? `✅ Slowmode désactivé dans ${interaction.channel}`
        : `🐢 Slowmode défini à **${seconds}s** dans ${interaction.channel}`
    );
  }
};