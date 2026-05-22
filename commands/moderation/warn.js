const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');
const { addStaffAction } = require('../../utils/staffStatsStore');

const {
  addWarn,
  getWarns
} = require('../../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Ajouter un avertissement à un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à avertir')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('La raison du warn')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'warn')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/warn`.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison');

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ Membre introuvable sur ce serveur.',
        ephemeral: true
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Tu ne peux pas te warn toi-même.',
        ephemeral: true
      });
    }

    if (member.id === interaction.client.user.id) {
      return interaction.reply({
        content: '❌ Je ne peux pas me warn moi-même.',
        ephemeral: true
      });
    }

    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ Tu ne peux pas warn un administrateur.',
        ephemeral: true
      });
    }

    if (
      interaction.member.roles.highest.position <= member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      return interaction.reply({
        content: '❌ Tu ne peux pas warn une personne avec un rôle égal ou supérieur au tien.',
        ephemeral: true
      });
    }

    addWarn(interaction.guild.id, user.id, {
      reason,
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      createdAt: new Date().toISOString()
    });

    addStaffAction(interaction.guild.id, interaction.user.id, 'warns');

    const warns = getWarns(interaction.guild.id, user.id);
    const totalWarns = Array.isArray(warns) ? warns.length : 0;

    const dmEmbed = new EmbedBuilder()
      .setTitle('⚠️ Avertissement')
      .setDescription(
        `Tu as reçu un avertissement sur le serveur **${interaction.guild.name}**.\n\n` +
        `**Raison :** ${reason}\n` +
        `**Modérateur :** ${interaction.user.tag}\n` +
        `**Total warns :** ${totalWarns}`
      )
      .setColor(0xfaa61a)
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] }).catch(() => null);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '⚠️ Membre warn',
      `**Utilisateur :** ${user.tag}\n` +
      `**ID :** ${user.id}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Total warns :** ${totalWarns}\n` +
      `**Raison :** ${reason}`,
      0xfaa61a
    );

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Warn ajouté')
      .setDescription(
        `**Membre :** ${user.tag}\n` +
        `**Modérateur :** ${interaction.user.tag}\n` +
        `**Total warns :** ${totalWarns}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xfaa61a)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};