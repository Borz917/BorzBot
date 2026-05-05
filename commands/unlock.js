const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Déverrouiller un salon')
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Salon à déverrouiller, vide = salon actuel')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du déverrouillage')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'unlock')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/unlock`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les salons`.',
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel('salon') || interaction.channel;
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: '❌ Tu dois choisir un salon textuel.',
        ephemeral: true
      });
    }

    const botPermissions = channel.permissionsFor(interaction.guild.members.me);

    if (!botPermissions?.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: `❌ Je ne peux pas gérer les permissions dans ${channel}.`,
        ephemeral: true
      });
    }

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null
    });

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🔓 Salon déverrouillé',
      `**Salon :** ${channel}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('🔓 Salon déverrouillé')
      .setDescription(
        `**Salon :** ${channel}\n` +
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