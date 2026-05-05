const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');
const { addStaffAction } = require('../utils/staffStatsStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulser un membre du serveur')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à expulser')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('La raison du kick')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'kick')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/kick`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Expulser des membres`.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
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
        content: '❌ Tu ne peux pas t’expulser toi-même.',
        ephemeral: true
      });
    }

    if (member.id === interaction.client.user.id) {
      return interaction.reply({
        content: '❌ Je ne peux pas m’expulser moi-même.',
        ephemeral: true
      });
    }

    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ Tu ne peux pas expulser un administrateur.',
        ephemeral: true
      });
    }

    if (
      interaction.member.roles.highest.position <= member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      return interaction.reply({
        content: '❌ Tu ne peux pas expulser une personne avec un rôle égal ou supérieur au tien.',
        ephemeral: true
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: '❌ Je ne peux pas expulser ce membre. Mets mon rôle au-dessus du sien.',
        ephemeral: true
      });
    }

    const dmEmbed = new EmbedBuilder()
      .setTitle('👢 Expulsion')
      .setDescription(
        `Tu as été expulsé du serveur **${interaction.guild.name}**.\n\n` +
        `**Raison :** ${reason}\n` +
        `**Modérateur :** ${interaction.user.tag}`
      )
      .setColor(0xed4245)
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] }).catch(() => null);

    await member.kick(`${reason} | Par ${interaction.user.tag}`);

    addStaffAction(interaction.guild.id, interaction.user.id, 'kicks');

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '👢 Membre expulsé',
      `**Utilisateur :** ${user.tag}\n` +
      `**ID :** ${user.id}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('👢 Kick effectué')
      .setDescription(
        `**Membre :** ${user.tag}\n` +
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