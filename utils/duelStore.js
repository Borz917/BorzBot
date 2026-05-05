const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const ranksPath = path.join(dataDir, 'duelRanks.json');

const activeDuels = new Map();

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(ranksPath)) {
    fs.writeFileSync(ranksPath, '{}', 'utf8');
  }
}

function loadRanks() {
  ensureFile();

  try {
    return JSON.parse(fs.readFileSync(ranksPath, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function saveRanks(data) {
  ensureFile();
  fs.writeFileSync(ranksPath, JSON.stringify(data, null, 2), 'utf8');
}

function createDuel(data) {
  const id = `duel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  activeDuels.set(id, {
    id,
    status: 'pending',
    choices: {},
    createdAt: Date.now(),
    ...data
  });

  return activeDuels.get(id);
}

function getDuel(id) {
  return activeDuels.get(id) || null;
}

function updateDuel(id, data) {
  activeDuels.set(id, data);
  return data;
}

function deleteDuel(id) {
  activeDuels.delete(id);
}

function getUserRank(guildId, userId) {
  const data = loadRanks();

  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) {
    data[guildId][userId] = {
      wins: 0,
      losses: 0,
      points: 1000
    };
  }

  saveRanks(data);
  return data[guildId][userId];
}

function addWin(winnerId, loserId, guildId = null) {
  const data = loadRanks();

  if (guildId) {
    if (!data[guildId]) data[guildId] = {};

    if (!data[guildId][winnerId]) {
      data[guildId][winnerId] = { wins: 0, losses: 0, points: 1000 };
    }

    if (!data[guildId][loserId]) {
      data[guildId][loserId] = { wins: 0, losses: 0, points: 1000 };
    }

    data[guildId][winnerId].wins += 1;
    data[guildId][winnerId].points += 25;

    data[guildId][loserId].losses += 1;
    data[guildId][loserId].points = Math.max(0, data[guildId][loserId].points - 15);

    saveRanks(data);
    return;
  }

  // Compatibilité avec ton ancien interactionCreate.js qui appelle addWin(winnerId, loserId)
  if (!data.global) data.global = {};

  if (!data.global[winnerId]) {
    data.global[winnerId] = { wins: 0, losses: 0, points: 1000 };
  }

  if (!data.global[loserId]) {
    data.global[loserId] = { wins: 0, losses: 0, points: 1000 };
  }

  data.global[winnerId].wins += 1;
  data.global[winnerId].points += 25;

  data.global[loserId].losses += 1;
  data.global[loserId].points = Math.max(0, data.global[loserId].points - 15);

  saveRanks(data);
}

function getLeaderboard(guildId) {
  const data = loadRanks();
  const guildRanks = data[guildId] || data.global || {};

  return Object.entries(guildRanks)
    .map(([userId, stats]) => ({
      userId,
      wins: stats.wins || 0,
      losses: stats.losses || 0,
      points: stats.points ?? 1000
    }))
    .sort((a, b) => b.points - a.points);
}

function resetUserRank(guildId, userId) {
  const data = loadRanks();

  if (data[guildId]?.[userId]) {
    delete data[guildId][userId];
  }

  if (data.global?.[userId]) {
    delete data.global[userId];
  }

  saveRanks(data);
}

function resetGuildRanks(guildId) {
  const data = loadRanks();

  if (data[guildId]) {
    delete data[guildId];
  }

  saveRanks(data);
}

module.exports = {
  createDuel,
  getDuel,
  updateDuel,
  deleteDuel,
  addWin,
  getUserRank,
  getLeaderboard,
  resetUserRank,
  resetGuildRanks
};