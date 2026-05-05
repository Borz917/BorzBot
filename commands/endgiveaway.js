const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

const {
  getActiveGiveaways,
  deleteGiveaway
} = require('../utils/giveawayStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('endgiveaway')
    .setDescription('Supprimer un giveaway invitations')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('ID du giveaway à supprimer')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison de la suppression')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'endgiveaway')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/endgiveaway`.',
        ephemeral: true
      });
    }

    const giveawayId = interaction.options.getString('id');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    const giveaways = getActiveGiveaways(interaction.guild.id);
    const giveaway = giveaways.find(g => g.id === giveawayId);

    if (!giveaway) {
      return interaction.reply({
        content: '❌ Giveaway introuvable.',
        ephemeral: true
      });
    }

    deleteGiveaway(interaction.guild.id, giveawayId);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🛑 Giveaway invitations supprimé',
      `**Nom :** ${giveaway.name}\n` +
      `**ID :** \`${giveaway.id}\`\n` +
      `**Récompense :** ${giveaway.reward}\n` +
      `**Supprimé par :** ${interaction.user.tag}\n` +
      `**Raison :** ${reason}`,
      0xed4245
    );

    const embed = new EmbedBuilder()
      .setTitle('🛑 Giveaway supprimé')
      .setDescription(
        `**Nom :** ${giveaway.name}\n` +
        `**ID :** \`${giveaway.id}\`\n` +
        `**Récompense :** ${giveaway.reward}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};