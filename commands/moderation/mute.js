const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');
const { addStaffAction } = require('../../utils/staffStatsStore');

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} minute(s)`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours} heure(s)`;

  return `${hours} heure(s) et ${remainingMinutes} minute(s)`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à mute')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('duree')
        .setDescription('Durée du mute en minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('La raison du mute')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'mute')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/mute`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Modérer les membres`.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const durationMinutes = interaction.options.getInteger('duree');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ Membre introuvable sur ce serveur.',
        ephemeral: true
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Tu ne peux pas te mute toi-même.',
        ephemeral: true
      });
    }

    if (member.id === interaction.client.user.id) {
      return interaction.reply({
        content: '❌ Je ne peux pas me mute moi-même.',
        ephemeral: true
      });
    }

    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ Tu ne peux pas mute un administrateur.',
        ephemeral: true
      });
    }

    if (
      interaction.member.roles.highest.position <= member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      return interaction.reply({
        content: '❌ Tu ne peux pas mute une personne avec un rôle égal ou supérieur au tien.',
        ephemeral: true
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: '❌ Je ne peux pas mute ce membre. Mets mon rôle au-dessus du sien.',
        ephemeral: true
      });
    }

    const durationMs = durationMinutes * 60 * 1000;
    const durationText = formatDuration(durationMinutes);

    const dmEmbed = new EmbedBuilder()
      .setTitle('🔇 Timeout')
      .setDescription(
        `Tu as été mute sur le serveur **${interaction.guild.name}**.\n\n` +
        `**Durée :** ${durationText}\n` +
        `**Raison :** ${reason}\n` +
        `**Modérateur :** ${interaction.user.tag}`
      )
      .setColor(0xfaa61a)
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] }).catch(() => null);

    await member.timeout(durationMs, `${reason} | Par ${interaction.user.tag}`);

    addStaffAction(interaction.guild.id, interaction.user.id, 'mutes');

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🔇 Membre mute',
      `**Utilisateur :** ${user.tag}\n` +
      `**ID :** ${user.id}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Durée :** ${durationText}\n` +
      `**Raison :** ${reason}`,
      0xfaa61a
    );

    const embed = new EmbedBuilder()
      .setTitle('🔇 Mute effectué')
      .setDescription(
        `**Membre :** ${user.tag}\n` +
        `**Modérateur :** ${interaction.user.tag}\n` +
        `**Durée :** ${durationText}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xfaa61a)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};