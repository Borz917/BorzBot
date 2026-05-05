const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { getServerConfig } = require('../utils/serverConfig');

function formatMs(ms) {
  if (!ms && ms !== 0) return 'Non défini';

  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) return `${seconds} seconde(s)`;

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes} minute(s)`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours} heure(s)`;

  return `${hours} heure(s) et ${remainingMinutes} minute(s)`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('securityview')
    .setDescription('Voir la configuration sécurité du serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'securityview')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/securityview`.',
        ephemeral: true
      });
    }

    const config = getServerConfig(interaction.guild.id);
    const security = config.security || {};
    const antiSpam = security.antiSpam || {};
    const antiLink = security.antiLink || {};

    const ignoredRoles =
      Array.isArray(security.ignoredRoleIds) && security.ignoredRoleIds.length > 0
        ? security.ignoredRoleIds.map(id => `<@&${id}>`).join('\n')
        : 'Aucun rôle ignoré';

    const allowedDomains =
      Array.isArray(antiLink.allowedDomains) && antiLink.allowedDomains.length > 0
        ? antiLink.allowedDomains.map(domain => `\`${domain}\``).join(', ')
        : 'Aucun domaine autorisé';

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Configuration sécurité')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '🚫 Anti-spam',
          value:
            `**Statut :** ${antiSpam.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
            `**Max messages :** ${antiSpam.maxMessages ?? 'Non défini'}\n` +
            `**Intervalle :** ${formatMs(antiSpam.intervalMs)}\n` +
            `**Timeout :** ${formatMs(antiSpam.timeoutMs)}\n` +
            `**Supprimer messages :** ${antiSpam.deleteMessages ? 'Oui' : 'Non'}`,
          inline: false
        },
        {
          name: '🔗 Anti-link',
          value:
            `**Statut :** ${antiLink.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
            `**Supprimer message :** ${antiLink.deleteMessage ? 'Oui' : 'Non'}\n` +
            `**Timeout :** ${formatMs(antiLink.timeoutMs)}\n` +
            `**Domaines autorisés :** ${allowedDomains}`,
          inline: false
        },
        {
          name: '🎭 Rôles ignorés',
          value: ignoredRoles,
          inline: false
        }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};