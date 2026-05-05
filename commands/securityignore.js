const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

const {
  getServerConfig,
  addIgnoredSecurityRole,
  removeIgnoredSecurityRole
} = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('securityignore')
    .setDescription('Gérer les rôles ignorés par la sécurité')
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Action à effectuer')
        .setRequired(true)
        .addChoices(
          { name: 'Ajouter un rôle ignoré', value: 'add' },
          { name: 'Retirer un rôle ignoré', value: 'remove' },
          { name: 'Voir les rôles ignorés', value: 'list' }
        )
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Rôle à ajouter ou retirer')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'securityignore')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/securityignore`.',
        ephemeral: true
      });
    }

    const action = interaction.options.getString('action');
    const role = interaction.options.getRole('role');

    if ((action === 'add' || action === 'remove') && !role) {
      return interaction.reply({
        content: '❌ Tu dois préciser un rôle.',
        ephemeral: true
      });
    }

    if (action === 'add') {
      addIgnoredSecurityRole(interaction.guild.id, role.id);

      await sendDiscordLog(
        interaction.guild,
        'moderation-logs',
        '🛡️ Rôle ignoré ajouté',
        `**Rôle :** ${role}\n**Modérateur :** ${interaction.user.tag}`,
        0x57f287
      );

      return interaction.reply({
        content: `✅ Le rôle ${role} est maintenant ignoré par la sécurité.`,
        ephemeral: true
      });
    }

    if (action === 'remove') {
      removeIgnoredSecurityRole(interaction.guild.id, role.id);

      await sendDiscordLog(
        interaction.guild,
        'moderation-logs',
        '🛡️ Rôle ignoré retiré',
        `**Rôle :** ${role}\n**Modérateur :** ${interaction.user.tag}`,
        0xed4245
      );

      return interaction.reply({
        content: `✅ Le rôle ${role} n’est plus ignoré par la sécurité.`,
        ephemeral: true
      });
    }

    const config = getServerConfig(interaction.guild.id);
    const ignoredRoles = config.security?.ignoredRoleIds || [];

    const text =
      ignoredRoles.length > 0
        ? ignoredRoles.map(id => `• <@&${id}>`).join('\n')
        : 'Aucun rôle ignoré.';

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Rôles ignorés par la sécurité')
      .setDescription(text)
      .setColor(0x5865f2)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};