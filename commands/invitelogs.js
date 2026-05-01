const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const {
  getUserInvites,
  getGuildInvites
} = require('../utils/inviteStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invitelogs')
    .setDescription('Affiche le nombre d’invitations')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à vérifier')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'invitelogs')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');

    if (user) {
      const data = getUserInvites(interaction.guild.id, user.id);

      const embed = new EmbedBuilder()
        .setTitle('📨 Invite Logs')
        .setColor(0x5865f2)
        .setDescription(
          `**Membre :** ${user}\n` +
          `**Invitations confirmées :** ${data.total}\n\n` +
          `**Utilisateurs invités :**\n` +
          `${data.users.length > 0 ? data.users.map(id => `• <@${id}>`).join('\n') : 'Aucun'}`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    const guildData = getGuildInvites(interaction.guild.id);

    const leaderboard = Object.entries(guildData)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10);

    if (leaderboard.length === 0) {
      return interaction.reply({
        content: '📨 Aucun invite log enregistré pour le moment.',
        ephemeral: true
      });
    }

    const text = leaderboard
      .map(([userId, data], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        return `${medal} <@${userId}> — **${data.total} invitation(s)**`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Classement Invitations')
      .setDescription(text)
      .setColor(0xfaa61a)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};