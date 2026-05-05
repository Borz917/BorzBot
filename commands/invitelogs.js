const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { getUserInvites, getGuildInvites } = require('../utils/inviteStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invitelogs')
    .setDescription('Voir les invitations d’un membre ou le top du serveur')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Membre à vérifier')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'invitelogs')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/invitelogs`.',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('membre');

    if (target) {
      const data = getUserInvites(interaction.guild.id, target.id);

      const invitedUsers =
        data.users && data.users.length > 0
          ? data.users.slice(0, 25).map(id => `• <@${id}>`).join('\n')
          : 'Aucune personne enregistrée.';

      const embed = new EmbedBuilder()
        .setTitle('📨 Invitations')
        .setDescription(
          `**Membre :** ${target}\n` +
          `**Total invitations :** ${data.total || 0}\n\n` +
          `**Personnes invitées :**\n${invitedUsers}` +
          `${data.users && data.users.length > 25 ? `\n\n+${data.users.length - 25} autre(s)` : ''}`
        )
        .setColor(0x5865f2)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Demandé par ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    const guildData = getGuildInvites(interaction.guild.id);

    const leaderboard = Object.entries(guildData)
      .sort(([, a], [, b]) => (b.total || 0) - (a.total || 0))
      .slice(0, 15);

    if (!leaderboard.length) {
      return interaction.reply({
        content: '📨 Aucune invitation enregistrée pour le moment.',
        ephemeral: true
      });
    }

    const text = leaderboard
      .map(([userId, data], index) => {
        const medal =
          index === 0 ? '🥇' :
          index === 1 ? '🥈' :
          index === 2 ? '🥉' :
          `#${index + 1}`;

        return `${medal} <@${userId}> — **${data.total || 0} invitation(s)**`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Top 15 Invitations')
      .setDescription(text)
      .setColor(0xfaa61a)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};