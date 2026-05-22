const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');

function formatSlowmode(seconds) {
  if (seconds === 0) return 'Désactivé';
  if (seconds < 60) return `${seconds} seconde(s)`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    if (remainingSeconds === 0) return `${minutes} minute(s)`;
    return `${minutes} minute(s) et ${remainingSeconds} seconde(s)`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours} heure(s)`;
  return `${hours} heure(s) et ${remainingMinutes} minute(s)`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Modifier le slowmode d’un salon')
    .addIntegerOption(option =>
      option
        .setName('secondes')
        .setDescription('Durée du slowmode en secondes, 0 pour désactiver')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Salon à modifier, vide = salon actuel')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du changement')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'slowmode')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/slowmode`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les salons`.',
        ephemeral: true
      });
    }

    const seconds = interaction.options.getInteger('secondes');
    const channel = interaction.options.getChannel('salon') || interaction.channel;
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: '❌ Tu dois choisir un salon textuel.',
        ephemeral: true
      });
    }

    if (!('setRateLimitPerUser' in channel)) {
      return interaction.reply({
        content: '❌ Ce salon ne supporte pas le slowmode.',
        ephemeral: true
      });
    }

    const botPermissions = channel.permissionsFor(interaction.guild.members.me);

    if (!botPermissions?.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: `❌ Je ne peux pas gérer le slowmode dans ${channel}.`,
        ephemeral: true
      });
    }

    await channel.setRateLimitPerUser(
      seconds,
      `${reason} | Par ${interaction.user.tag}`
    );

    const slowmodeText = formatSlowmode(seconds);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      seconds === 0 ? '⚡ Slowmode désactivé' : '🐢 Slowmode modifié',
      `**Salon :** ${channel}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Durée :** ${slowmodeText}\n` +
      `**Raison :** ${reason}`,
      seconds === 0 ? 0x57f287 : 0xfaa61a
    );

    const embed = new EmbedBuilder()
      .setTitle(seconds === 0 ? '⚡ Slowmode désactivé' : '🐢 Slowmode modifié')
      .setDescription(
        `**Salon :** ${channel}\n` +
        `**Durée :** ${slowmodeText}\n` +
        `**Modérateur :** ${interaction.user.tag}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(seconds === 0 ? 0x57f287 : 0xfaa61a)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};