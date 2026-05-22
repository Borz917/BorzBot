const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Retirer le timeout d’un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à unmute')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('La raison du unmute')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'unmute')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/unmute`.',
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
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ Membre introuvable sur ce serveur.',
        ephemeral: true
      });
    }

    if (!member.communicationDisabledUntilTimestamp) {
      return interaction.reply({
        content: '❌ Ce membre n’est pas mute.',
        ephemeral: true
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: '❌ Je ne peux pas unmute ce membre. Mets mon rôle au-dessus du sien.',
        ephemeral: true
      });
    }

    await member.timeout(null, `${reason} | Unmute par ${interaction.user.tag}`);

    const dmEmbed = new EmbedBuilder()
      .setTitle('🔊 Unmute')
      .setDescription(
        `Ton mute a été retiré sur le serveur **${interaction.guild.name}**.\n\n` +
        `**Raison :** ${reason}\n` +
        `**Modérateur :** ${interaction.user.tag}`
      )
      .setColor(0x57f287)
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] }).catch(() => null);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🔊 Membre unmute',
      `**Utilisateur :** ${user.tag}\n` +
      `**ID :** ${user.id}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('🔊 Unmute effectué')
      .setDescription(
        `**Membre :** ${user.tag}\n` +
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