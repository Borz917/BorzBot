const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleterole')
    .setDescription('Supprimer un rôle du serveur')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Le rôle à supprimer')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison de la suppression du rôle')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'deleterole')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/deleterole`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les rôles`.',
        ephemeral: true
      });
    }

    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!role) {
      return interaction.reply({
        content: '❌ Rôle introuvable.',
        ephemeral: true
      });
    }

    if (role.id === interaction.guild.roles.everyone.id) {
      return interaction.reply({
        content: '❌ Tu ne peux pas supprimer le rôle `@everyone`.',
        ephemeral: true
      });
    }

    if (role.managed) {
      return interaction.reply({
        content: '❌ Je ne peux pas supprimer un rôle géré par une intégration ou un bot.',
        ephemeral: true
      });
    }

    if (
      interaction.member.roles.highest.position <= role.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      return interaction.reply({
        content: '❌ Tu ne peux pas supprimer un rôle égal ou supérieur au tien.',
        ephemeral: true
      });
    }

    if (interaction.guild.members.me.roles.highest.position <= role.position) {
      return interaction.reply({
        content: '❌ Je ne peux pas supprimer ce rôle. Mets mon rôle au-dessus.',
        ephemeral: true
      });
    }

    const roleName = role.name;
    const roleId = role.id;
    const roleColor = role.hexColor || '#000000';
    const membersWithRole = role.members.size;

    await role.delete(`${reason} | Par ${interaction.user.tag}`);

    await sendDiscordLog(
      interaction.guild,
      'roles-logs',
      '🗑️ Rôle supprimé',
      `**Rôle :** ${roleName}\n` +
      `**ID rôle :** ${roleId}\n` +
      `**Membres concernés :** ${membersWithRole}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Rôle supprimé')
      .setDescription(
        `**Rôle :** ${roleName}\n` +
        `**ID rôle :** ${roleId}\n` +
        `**Membres concernés :** ${membersWithRole}\n` +
        `**Modérateur :** ${interaction.user.tag}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(roleColor === '#000000' ? 0xed4245 : roleColor)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};