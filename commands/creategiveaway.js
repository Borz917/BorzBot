const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');
const { createGiveaway } = require('../utils/giveawayStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('creategiveaway')
    .setDescription('Créer un giveaway basé sur les invitations')
    .addStringOption(option =>
      option
        .setName('nom')
        .setDescription('Nom du giveaway')
        .setRequired(true)
        .setMaxLength(80)
    )
    .addStringOption(option =>
      option
        .setName('recompense')
        .setDescription('Récompense du giveaway')
        .setRequired(true)
        .setMaxLength(150)
    )
    .addIntegerOption(option =>
      option
        .setName('invitations')
        .setDescription('Nombre d’invitations nécessaires')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1000)
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Description du giveaway')
        .setRequired(false)
        .setMaxLength(500)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'creategiveaway')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/creategiveaway`.',
        ephemeral: true
      });
    }

    const name = interaction.options.getString('nom');
    const reward = interaction.options.getString('recompense');
    const invitesRequired = interaction.options.getInteger('invitations');
    const description = interaction.options.getString('description') || 'Aucune description.';

    const giveaway = createGiveaway(interaction.guild.id, {
      name,
      reward,
      invitesRequired,
      description,
      createdBy: interaction.user.id,
      createdByTag: interaction.user.tag,
      createdAt: new Date().toISOString()
    });

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🎁 Giveaway invitations créé',
      `**Nom :** ${giveaway.name}\n` +
      `**ID :** \`${giveaway.id}\`\n` +
      `**Récompense :** ${giveaway.reward}\n` +
      `**Invitations nécessaires :** ${giveaway.invitesRequired}\n` +
      `**Créé par :** ${interaction.user.tag}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('🎁 Giveaway créé')
      .setDescription(
        `**Nom :** ${giveaway.name}\n` +
        `**ID :** \`${giveaway.id}\`\n` +
        `**Récompense :** ${giveaway.reward}\n` +
        `**Invitations nécessaires :** ${giveaway.invitesRequired}\n\n` +
        `**Description :** ${giveaway.description}`
      )
      .setColor(0x57f287)
      .setFooter({ text: `Créé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};