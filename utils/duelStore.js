const fs = require('fs');
const path = require('path');

const activeDuels = new Map();

const dataDir = path.join(__dirname, '..', 'data');
const rankingsPath = path.join(dataDir, 'rankings.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(rankingsPath)) fs.writeFileSync(rankingsPath, '{}', 'utf8');
}

function loadRankings() {
  ensureFile();
  return JSON.parse(fs.readFileSync(rankingsPath, 'utf8') || '{}');
}

function saveRankings(data) {
  ensureFile();
  fs.writeFileSync(rankingsPath, JSON.stringify(data, null, 2), 'utf8');
}

function createDuel(id, data) {
  activeDuels.set(id, data);
}

function getDuel(id) {
  return activeDuels.get(id);
}

function updateDuel(id, data) {
  activeDuels.set(id, data);
}

function deleteDuel(id) {
  activeDuels.delete(id);
}

function getPoints(userId) {
  const rankings = loadRankings();
  return rankings[userId] ?? 1000;
}

function setPoints(userId, points) {
  const rankings = loadRankings();
  rankings[userId] = points;
  saveRankings(rankings);
}

function addWin(winnerId, loserId) {
  setPoints(winnerId, getPoints(winnerId) + 25);
  setPoints(loserId, Math.max(0, getPoints(loserId) - 15));
}

function resetRank(userId) {
  setPoints(userId, 1000);
}

function getRanking(userId) {
  return getPoints(userId);
}

function getAllRankings() {
  const rankings = loadRankings();

  return Object.entries(rankings).map(([userId, points]) => ({
    userId,
    points
  }));
}

module.exports = {
  createDuel,
  getDuel,
  updateDuel,
  deleteDuel,
  addWin,
  resetRank,
  getRanking,
  getAllRankings
};