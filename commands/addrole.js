const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Ajouter un rôle à un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre qui va recevoir le rôle')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Le rôle à ajouter')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison de l’ajout du rôle')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'addrole')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/addrole`.',
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
        content: '❌ Je ne peux pas ajouter un rôle géré par une intégration ou un bot.',
        ephemeral: true
      });
    }

    if (role.id === interaction.guild.roles.everyone.id) {
      return interaction.reply({
        content: '❌ Tu ne peux pas ajouter le rôle `@everyone`.',
        ephemeral: true
      });
    }

    if (
      interaction.member.roles.highest.position <= role.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      return interaction.reply({
        content: '❌ Tu ne peux pas ajouter un rôle égal ou supérieur au tien.',
        ephemeral: true
      });
    }

    if (interaction.guild.members.me.roles.highest.position <= role.position) {
      return interaction.reply({
        content: '❌ Je ne peux pas ajouter ce rôle. Mets mon rôle au-dessus.',
        ephemeral: true
      });
    }

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({
        content: `❌ ${user.tag} possède déjà le rôle ${role}.`,
        ephemeral: true
      });
    }

    await member.roles.add(role, `${reason} | Par ${interaction.user.tag}`);

    await sendDiscordLog(
      interaction.guild,
      'roles-logs',
      '🎭 Rôle ajouté',
      `**Membre :** ${user.tag}\n` +
      `**ID membre :** ${user.id}\n` +
      `**Rôle :** ${role}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('🎭 Rôle ajouté')
      .setDescription(
        `**Membre :** ${user.tag}\n` +
        `**Rôle :** ${role}\n` +
        `**Modérateur :** ${interaction.user.tag}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};