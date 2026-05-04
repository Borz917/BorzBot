const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const statsPath = path.join(dataDir, 'staffStats.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(statsPath)) {
    fs.writeFileSync(statsPath, '{}', 'utf8');
  }
}

function loadStats() {
  ensureFile();

  try {
    return JSON.parse(fs.readFileSync(statsPath, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function saveStats(data) {
  ensureFile();
  fs.writeFileSync(statsPath, JSON.stringify(data, null, 2), 'utf8');
}

function getDefaultStats() {
  return {
    warns: 0,
    mutes: 0,
    bans: 0,
    kicks: 0,
    ticketClaims: 0,
    ticketCloses: 0,
    total: 0
  };
}

function ensureGuildUser(data, guildId, userId) {
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = getDefaultStats();

  return data[guildId][userId];
}

function addStaffAction(guildId, userId, action) {
  const data = loadStats();
  const stats = ensureGuildUser(data, guildId, userId);

  if (typeof stats[action] !== 'number') {
    stats[action] = 0;
  }

  stats[action] += 1;
  stats.total += 1;

  saveStats(data);

  return stats;
}

function getStaffStats(guildId, userId) {
  const data = loadStats();
  return data[guildId]?.[userId] || getDefaultStats();
}

function getGuildStaffStats(guildId) {
  const data = loadStats();
  return data[guildId] || {};
}

function resetStaffStats(guildId, userId = null) {
  const data = loadStats();

  if (!data[guildId]) return;

  if (userId) {
    delete data[guildId][userId];
  } else {
    delete data[guildId];
  }

  saveStats(data);
}

module.exports = {
  addStaffAction,
  getStaffStats,
  getGuildStaffStats,
  resetStaffStats
};