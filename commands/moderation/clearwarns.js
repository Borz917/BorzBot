const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');

const {
  getWarns,
  clearWarns
} = require('../../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Supprimer tous les warns d’un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre concerné')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison de la suppression des warns')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'clearwarns')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/clearwarns`.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    const warns = getWarns(interaction.guild.id, user.id);

    if (!Array.isArray(warns) || warns.length === 0) {
      return interaction.reply({
        content: `✅ ${user.tag} n’a aucun warn à supprimer.`,
        ephemeral: true
      });
    }

    const oldTotal = warns.length;

    clearWarns(interaction.guild.id, user.id);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🧹 Warns supprimés',
      `**Utilisateur :** ${user.tag}\n` +
      `**ID :** ${user.id}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Warns supprimés :** ${oldTotal}\n` +
      `**Raison :** ${reason}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('🧹 Warns supprimés')
      .setDescription(
        `**Membre :** ${user.tag}\n` +
        `**Warns supprimés :** ${oldTotal}\n` +
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