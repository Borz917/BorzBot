const { getServerConfig } = require('../utils/serverConfig');
const { addMessage, getRecentMessages, clearUser } = require('../utils/securityStore');
const sendDiscordLog = require('../utils/sendDiscordLog');

function hasIgnoredRole(member, ignoredRoleIds) {
  if (!member || !member.roles) return false;

  return member.roles.cache.some(role => ignoredRoleIds.includes(role.id));
}

function containsLink(content) {
  const regex = /(https?:\/\/|www\.|discord\.gg\/|discord\.com\/invite\/)/i;
  return regex.test(content);
}

function isAllowedDomain(content, allowedDomains) {
  return allowedDomains.some(domain =>
    content.toLowerCase().includes(domain.toLowerCase())
  );
}

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    try {
      if (!message.guild) return;
      if (message.author.bot) return;

      const member = message.member;
      if (!member) return;

      const serverConfig = getServerConfig(message.guild.id);
      const security = serverConfig.security;

      if (hasIgnoredRole(member, security.ignoredRoleIds)) return;

      // =========================
      // ANTI-LINK
      // =========================
      if (security.antiLink.enabled && containsLink(message.content)) {
        if (!isAllowedDomain(message.content, security.antiLink.allowedDomains)) {
          if (security.antiLink.deleteMessage) {
            await message.delete().catch(() => null);
          }

          if (member.moderatable && security.antiLink.timeoutMs > 0) {
            await member.timeout(
              security.antiLink.timeoutMs,
              'Anti-link BorzBot'
            ).catch(() => null);
          }

          await sendDiscordLog(
            message.guild,
            'moderation-logs',
            '🔗 Anti-link détecté',
            `**Utilisateur :** ${message.author.tag}\n` +
            `**ID :** ${message.author.id}\n` +
            `**Salon :** ${message.channel}\n` +
            `**Message :** ${message.content}\n` +
            `**Action :** Message supprimé + timeout`,
            0xed4245
          );

          return;
        }
      }

      // =========================
      // ANTI-SPAM
      // =========================
      if (security.antiSpam.enabled) {
        addMessage(message.author.id);

        const recentMessages = getRecentMessages(
          message.author.id,
          security.antiSpam.intervalMs
        );

        if (recentMessages.length >= security.antiSpam.maxMessages) {
          clearUser(message.author.id);

          if (security.antiSpam.deleteMessages) {
            const fetched = await message.channel.messages.fetch({ limit: 20 }).catch(() => null);

            if (fetched) {
              const userMessages = fetched.filter(
                msg => msg.author.id === message.author.id
              );

              await message.channel.bulkDelete(userMessages, true).catch(() => null);
            }
          }

          if (member.moderatable && security.antiSpam.timeoutMs > 0) {
            await member.timeout(
              security.antiSpam.timeoutMs,
              'Anti-spam BorzBot'
            ).catch(() => null);
          }

          await sendDiscordLog(
            message.guild,
            'moderation-logs',
            '🚨 Anti-spam détecté',
            `**Utilisateur :** ${message.author.tag}\n` +
            `**ID :** ${message.author.id}\n` +
            `**Salon :** ${message.channel}\n` +
            `**Messages :** ${recentMessages.length} messages en ${security.antiSpam.intervalMs / 1000}s\n` +
            `**Action :** Suppression + timeout`,
            0xed4245
          );

          return;
        }
      }
    } catch (error) {
      console.error('Erreur messageCreate sécurité :', error);
    }
  }
};