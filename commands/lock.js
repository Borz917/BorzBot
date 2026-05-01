const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Verrouille le salon actuel'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'lock')) {
      return interaction.reply({ content: '❌ Tu n’as pas la permission.', ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    });

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🔒 Salon verrouillé',
      `**Salon :** ${interaction.channel}\n**Modérateur :** ${interaction.user.tag}`,
      0xed4245
    );

    await interaction.reply(`🔒 Salon verrouillé : ${interaction.channel}`);
  }
};