const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const { getServerConfig } = require('../../utils/serverConfig');

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
    .setName('raidview')
    .setDescription('Voir la configuration anti-raid du serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidview')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/raidview`.',
        ephemeral: true
      });
    }

    const config = getServerConfig(interaction.guild.id);
    const raid = config.raid || {};

    const whitelistRoles =
      Array.isArray(raid.whitelistRoleIds) && raid.whitelistRoleIds.length > 0
        ? raid.whitelistRoleIds.map(id => `• <@&${id}>`).join('\n')
        : 'Aucun rôle whitelist.';

    const ignoredChannels =
      Array.isArray(raid.lockIgnoredChannelIds) && raid.lockIgnoredChannelIds.length > 0
        ? raid.lockIgnoredChannelIds.map(id => `• <#${id}>`).join('\n')
        : 'Aucun salon ignoré.';

    const embed = new EmbedBuilder()
      .setTitle('🚨 Configuration Anti-Raid')
      .setColor(0xed4245)
      .addFields(
        {
          name: '⚙️ Général',
          value:
            `**Statut :** ${raid.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
            `**Limite de joins :** ${raid.joinsLimit || 0}\n` +
            `**Intervalle :** ${formatMs(raid.intervalMs)}\n` +
            `**Action :** \`${raid.action || 'alert'}\``,
          inline: false
        },
        {
          name: '🎭 Rôles whitelist',
          value: whitelistRoles,
          inline: false
        },
        {
          name: '💬 Salons ignorés lors du raidlock',
          value: ignoredChannels,
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