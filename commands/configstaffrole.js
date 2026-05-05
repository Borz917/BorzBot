const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');
const { setStaffRole } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configstaffrole')
    .setDescription('Configurer le rôle staff principal')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Rôle staff principal')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configstaffrole')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/configstaffrole`.',
        ephemeral: true
      });
    }

    const role = interaction.options.getRole('role');

    setStaffRole(interaction.guild.id, role.id);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '⚙️ Rôle staff configuré',
      `**Rôle :** ${role}\n**Par :** ${interaction.user.tag}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Rôle staff configuré')
      .setDescription(`Le rôle staff principal est maintenant : ${role}`)
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};