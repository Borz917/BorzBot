const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');
const { setNotifRole } = require('../../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('confignotifrole')
    .setDescription('Configurer les rôles notifications pour les annonces')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type de notification')
        .setRequired(true)
        .addChoices(
          { name: 'Illégal', value: 'illegal' },
          { name: 'Légal', value: 'legal' },
          { name: 'Giveaways', value: 'giveaways' },
          { name: 'Evénement', value: 'evenement' }
        )
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Rôle à mentionner')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'confignotifrole')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/confignotifrole`.',
        ephemeral: true
      });
    }

    const type = interaction.options.getString('type');
    const role = interaction.options.getRole('role');

    setNotifRole(interaction.guild.id, type, role.id);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🔔 Rôle notification configuré',
      `**Type :** \`${type}\`\n**Rôle :** ${role}\n**Par :** ${interaction.user.tag}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('🔔 Rôle notification configuré')
      .setDescription(
        `**Type :** \`${type}\`\n` +
        `**Rôle :** ${role}`
      )
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};