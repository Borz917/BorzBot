const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Déverrouille le salon actuel'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'unlock')) {
      return interaction.reply({ content: '❌ Tu n’as pas la permission.', ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null
    });

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🔓 Salon déverrouillé',
      `**Salon :** ${interaction.channel}\n**Modérateur :** ${interaction.user.tag}`,
      0x57f287
    );

    await interaction.reply(`🔓 Salon déverrouillé : ${interaction.channel}`);
  }
};