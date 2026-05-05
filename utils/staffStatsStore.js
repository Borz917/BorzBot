const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const filePath = path.join(dataDir, 'staffStats.json');

const defaultStats = {
  warns: 0,
  mutes: 0,
  bans: 0,
  kicks: 0,
  ticketClaims: 0,
  ticketCloses: 0,
  total: 0,
  lastActionAt: null
};

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '{}', 'utf8');
  }
}

function loadStats() {
  ensureFile();

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function saveStats(data) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function ensureUserStats(data, guildId, userId) {
  if (!data[guildId]) {
    data[guildId] = {};
  }

  if (!data[guildId][userId]) {
    data[guildId][userId] = { ...defaultStats };
  }

  return data[guildId][userId];
}

function recalculateTotal(stats) {
  stats.total =
    (stats.warns || 0) +
    (stats.mutes || 0) +
    (stats.bans || 0) +
    (stats.kicks || 0) +
    (stats.ticketClaims || 0) +
    (stats.ticketCloses || 0);

  return stats.total;
}

function addStaffAction(guildId, userId, action) {
  const data = loadStats();
  const stats = ensureUserStats(data, guildId, userId);

  if (typeof stats[action] !== 'number') {
    stats[action] = 0;
  }

  stats[action] += 1;
  stats.lastActionAt = new Date().toISOString();

  recalculateTotal(stats);
  saveStats(data);

  return stats;
}

function getStaffStats(guildId, userId) {
  const data = loadStats();
  const stats = ensureUserStats(data, guildId, userId);

  recalculateTotal(stats);
  saveStats(data);

  return stats;
}

function getGuildStaffStats(guildId) {
  const data = loadStats();

  if (!data[guildId]) {
    return {};
  }

  for (const userId of Object.keys(data[guildId])) {
    recalculateTotal(data[guildId][userId]);
  }

  saveStats(data);

  return data[guildId];
}

function getStaffTop(guildId, limit = 10) {
  const guildStats = getGuildStaffStats(guildId);

  return Object.entries(guildStats)
    .map(([userId, stats]) => ({
      userId,
      ...stats,
      total:
        (stats.warns || 0) +
        (stats.mutes || 0) +
        (stats.bans || 0) +
        (stats.kicks || 0) +
        (stats.ticketClaims || 0) +
        (stats.ticketCloses || 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

function resetStaffStats(guildId, userId) {
  const data = loadStats();

  if (data[guildId] && data[guildId][userId]) {
    delete data[guildId][userId];
    saveStats(data);
    return true;
  }

  return false;
}

function resetGuildStaffStats(guildId) {
  const data = loadStats();

  if (data[guildId]) {
    delete data[guildId];
    saveStats(data);
    return true;
  }

  return false;
}

module.exports = {
  addStaffAction,
  getStaffStats,
  getGuildStaffStats,
  getStaffTop,
  resetStaffStats,
  resetGuildStaffStats
};