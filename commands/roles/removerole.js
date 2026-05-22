const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Retirer un rôle à un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à qui retirer le rôle')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Le rôle à retirer')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du retrait du rôle')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'removerole')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/removerole`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les rôles`.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ Membre introuvable sur ce serveur.',
        ephemeral: true
      });
    }

    if (role.managed) {
      return interaction.reply({
        content: '❌ Je ne peux pas retirer un rôle géré par une intégration ou un bot.',
        ephemeral: true
      });
    }

    if (role.id === interaction.guild.roles.everyone.id) {
      return interaction.reply({
        content: '❌ Tu ne peux pas retirer le rôle `@everyone`.',
        ephemeral: true
      });
    }

    if (
      interaction.member.roles.highest.position <= role.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      return interaction.reply({
        content: '❌ Tu ne peux pas retirer un rôle égal ou supérieur au tien.',
        ephemeral: true
      });
    }

    if (interaction.guild.members.me.roles.highest.position <= role.position) {
      return interaction.reply({
        content: '❌ Je ne peux pas retirer ce rôle. Mets mon rôle au-dessus.',
        ephemeral: true
      });
    }

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: `❌ ${user.tag} ne possède pas le rôle ${role}.`,
        ephemeral: true
      });
    }

    await member.roles.remove(role, `${reason} | Par ${interaction.user.tag}`);

    await sendDiscordLog(
      interaction.guild,
      'roles-logs',
      '🎭 Rôle retiré',
      `**Membre :** ${user.tag}\n` +
      `**ID membre :** ${user.id}\n` +
      `**Rôle :** ${role}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('🎭 Rôle retiré')
      .setDescription(
        `**Membre :** ${user.tag}\n` +
        `**Rôle :** ${role}\n` +
        `**Modérateur :** ${interaction.user.tag}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};