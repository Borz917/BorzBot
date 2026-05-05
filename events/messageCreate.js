const { PermissionsBitField } = require('discord.js');
const sendDiscordLog = require('../utils/sendDiscordLog');
const { getServerConfig } = require('../utils/serverConfig');

const spamCache = new Map();

function normalizeDomain(domain) {
  return String(domain || '')
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

function extractLinks(content) {
  const regex = /(https?:\/\/[^\s]+|www\.[^\s]+|discord\.gg\/[^\s]+|discord\.com\/invite\/[^\s]+)/gi;
  return content.match(regex) || [];
}

function getDomainFromLink(link) {
  let cleanLink = link.trim();

  if (cleanLink.startsWith('www.')) {
    cleanLink = `https://${cleanLink}`;
  }

  if (cleanLink.startsWith('discord.gg/')) {
    return 'discord.gg';
  }

  try {
    const url = new URL(cleanLink);
    return normalizeDomain(url.hostname);
  } catch {
    return normalizeDomain(cleanLink);
  }
}

function hasIgnoredRole(member, ignoredRoleIds = []) {
  if (!member || !Array.isArray(ignoredRoleIds)) return false;

  return member.roles.cache.some(role => ignoredRoleIds.includes(role.id));
}

function isAllowedDomain(domain, allowedDomains = []) {
  const cleanDomain = normalizeDomain(domain);

  return allowedDomains.some(allowed => {
    const cleanAllowed = normalizeDomain(allowed);

    return (
      cleanDomain === cleanAllowed ||
      cleanDomain.endsWith(`.${cleanAllowed}`)
    );
  });
}

async function timeoutMember(member, durationMs, reason) {
  if (!member || !durationMs) return false;

  if (!member.moderatable) {
    return false;
  }

  await member.timeout(durationMs, reason).catch(() => null);
  return true;
}

async function deleteMessage(message) {
  if (!message.deletable) return false;

  await message.delete().catch(() => null);
  return true;
}

async function handleAntiLink(message, config) {
  const antiLink = config.security?.antiLink;

  if (!antiLink?.enabled) return false;

  const links = extractLinks(message.content);

  if (!links.length) return false;

  const allowedDomains = antiLink.allowedDomains || [];

  const forbiddenLinks = links.filter(link => {
    const domain = getDomainFromLink(link);
    return !isAllowedDomain(domain, allowedDomains);
  });

  if (!forbiddenLinks.length) return false;

  if (antiLink.deleteMessage) {
    await deleteMessage(message);
  }

  const timeoutMs = antiLink.timeoutMs || 5 * 60 * 1000;

  const didTimeout = await timeoutMember(
    message.member,
    timeoutMs,
    'Anti-link BorzBot'
  );

  await sendDiscordLog(
    message.guild,
    'moderation-logs',
    '🔗 Lien interdit détecté',
    `**Membre :** ${message.author.tag} (${message.author.id})\n` +
    `**Salon :** ${message.channel}\n` +
    `**Lien(s) :** ${forbiddenLinks.map(link => `\`${link.slice(0, 100)}\``).join(', ')}\n` +
    `**Message supprimé :** ${antiLink.deleteMessage ? 'Oui' : 'Non'}\n` +
    `**Timeout :** ${didTimeout ? `${Math.floor(timeoutMs / 60000)} min` : 'Non'}`,
    0xed4245
  );

  return true;
}

async function handleAntiSpam(message, config) {
  const antiSpam = config.security?.antiSpam;

  if (!antiSpam?.enabled) return false;

  const guildId = message.guild.id;
  const userId = message.author.id;
  const key = `${guildId}:${userId}`;

  const now = Date.now();
  const intervalMs = antiSpam.intervalMs || 7000;
  const maxMessages = antiSpam.maxMessages || 5;
  const timeoutMs = antiSpam.timeoutMs || 10 * 60 * 1000;

  const oldData = spamCache.get(key) || [];
  const recentMessages = oldData.filter(item => now - item.createdAt <= intervalMs);

  recentMessages.push({
    messageId: message.id,
    channelId: message.channel.id,
    createdAt: now
  });

  spamCache.set(key, recentMessages);

  if (recentMessages.length < maxMessages) {
    return false;
  }

  let deletedCount = 0;

  if (antiSpam.deleteMessages) {
    for (const item of recentMessages) {
      const channel = message.guild.channels.cache.get(item.channelId);

      if (!channel || !channel.isTextBased()) continue;

      const msg = await channel.messages.fetch(item.messageId).catch(() => null);

      if (msg && msg.deletable) {
        await msg.delete().then(() => {
          deletedCount++;
        }).catch(() => null);
      }
    }
  }

  const didTimeout = await timeoutMember(
    message.member,
    timeoutMs,
    'Anti-spam BorzBot'
  );

  spamCache.delete(key);

  await sendDiscordLog(
    message.guild,
    'moderation-logs',
    '🚫 Spam détecté',
    `**Membre :** ${message.author.tag} (${message.author.id})\n` +
    `**Salon :** ${message.channel}\n` +
    `**Messages détectés :** ${recentMessages.length}\n` +
    `**Messages supprimés :** ${deletedCount}\n` +
    `**Timeout :** ${didTimeout ? `${Math.floor(timeoutMs / 60000)} min` : 'Non'}`,
    0xed4245
  );

  return true;
}

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    try {
      if (!message.guild) return;
      if (!message.member) return;
      if (message.author.bot) return;

      const config = getServerConfig(message.guild.id);
      const ignoredRoleIds = config.security?.ignoredRoleIds || [];

      if (hasIgnoredRole(message.member, ignoredRoleIds)) return;

      if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
      if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

      const botMember = message.guild.members.me;

      if (!botMember.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await sendDiscordLog(
          message.guild,
          'moderation-logs',
          '⚠️ Permission manquante',
          `Anti-spam / anti-link actif, mais je n’ai pas la permission **Modérer les membres**.`,
          0xfaa61a
        );

        return;
      }

      await handleAntiLink(message, config);
      await handleAntiSpam(message, config);
    } catch (error) {
      console.error('Erreur messageCreate :', error);
    }
  }
};