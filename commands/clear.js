const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprimer plusieurs messages dans un salon')
    .addIntegerOption(option =>
      option
        .setName('nombre')
        .setDescription('Nombre de messages à supprimer')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Supprimer uniquement les messages de ce membre')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du clear')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'clear')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/clear`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les messages`.',
        ephemeral: true
      });
    }

    if (!interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission de gérer les messages dans ce salon.',
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger('nombre');
    const targetUser = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    await interaction.deferReply({ ephemeral: true });

    const fetchedMessages = await interaction.channel.messages.fetch({
      limit: amount
    }).catch(() => null);

    if (!fetchedMessages || fetchedMessages.size === 0) {
      return interaction.editReply({
        content: '❌ Aucun message trouvé à supprimer.'
      });
    }

    let messagesToDelete = fetchedMessages;

    if (targetUser) {
      messagesToDelete = fetchedMessages.filter(msg => msg.author.id === targetUser.id);
    }

    if (messagesToDelete.size === 0) {
      return interaction.editReply({
        content: `❌ Aucun message trouvé pour ${targetUser}.`
      });
    }

    const deletedMessages = await interaction.channel.bulkDelete(messagesToDelete, true).catch(() => null);

    if (!deletedMessages) {
      return interaction.editReply({
        content: '❌ Impossible de supprimer les messages. Certains messages sont peut-être trop anciens.'
      });
    }

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🧹 Messages supprimés',
      `**Salon :** ${interaction.channel}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Nombre demandé :** ${amount}\n` +
      `**Nombre supprimé :** ${deletedMessages.size}\n` +
      `**Cible :** ${targetUser ? targetUser.tag : 'Tout le monde'}\n` +
      `**Raison :** ${reason}`,
      0x5865f2
    );

    const embed = new EmbedBuilder()
      .setTitle('🧹 Clear effectué')
      .setDescription(
        `**Messages supprimés :** ${deletedMessages.size}\n` +
        `**Salon :** ${interaction.channel}\n` +
        `**Cible :** ${targetUser ? targetUser.tag : 'Tout le monde'}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0x5865f2)
      .setTimestamp();

    return interaction.editReply({
      embeds: [embed]
    });
  }
};