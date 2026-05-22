const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');
const { addStaffAction } = require('../../utils/staffStatsStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre du serveur')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à bannir')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('La raison du bannissement')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('jours_messages')
        .setDescription('Nombre de jours de messages à supprimer')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'ban')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/ban`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Bannir des membres`.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';
    const deleteMessageDays = interaction.options.getInteger('jours_messages') ?? 0;

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Tu ne peux pas te bannir toi-même.',
        ephemeral: true
      });
    }

    if (user.id === interaction.client.user.id) {
      return interaction.reply({
        content: '❌ Je ne peux pas me bannir moi-même.',
        ephemeral: true
      });
    }

    if (member) {
      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
          content: '❌ Tu ne peux pas bannir un administrateur.',
          ephemeral: true
        });
      }

      if (
        interaction.member.roles.highest.position <= member.roles.highest.position &&
        interaction.guild.ownerId !== interaction.user.id
      ) {
        return interaction.reply({
          content: '❌ Tu ne peux pas bannir une personne avec un rôle égal ou supérieur au tien.',
          ephemeral: true
        });
      }

      if (!member.bannable) {
        return interaction.reply({
          content: '❌ Je ne peux pas bannir ce membre. Mets mon rôle au-dessus du sien.',
          ephemeral: true
        });
      }

      const dmEmbed = new EmbedBuilder()
        .setTitle('🔨 Bannissement')
        .setDescription(
          `Tu as été banni du serveur **${interaction.guild.name}**.\n\n` +
          `**Raison :** ${reason}\n` +
          `**Modérateur :** ${interaction.user.tag}`
        )
        .setColor(0xed4245)
        .setTimestamp();

      await member.send({ embeds: [dmEmbed] }).catch(() => null);
    }

    await interaction.guild.members.ban(user.id, {
      reason: `${reason} | Par ${interaction.user.tag}`,
      deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60
    });

    addStaffAction(interaction.guild.id, interaction.user.id, 'bans');

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🔨 Membre banni',
      `**Utilisateur :** ${user.tag}\n` +
      `**ID :** ${user.id}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Messages supprimés :** ${deleteMessageDays} jour(s)\n` +
      `**Raison :** ${reason}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('🔨 Ban effectué')
      .setDescription(
        `**Membre :** ${user.tag}\n` +
        `**Modérateur :** ${interaction.user.tag}\n` +
        `**Messages supprimés :** ${deleteMessageDays} jour(s)\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};