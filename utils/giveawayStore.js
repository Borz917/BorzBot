const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const filePath = path.join(dataDir, 'giveaways.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '{}', 'utf8');
  }
}

function loadGiveaways() {
  ensureFile();

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function saveGiveaways(data) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getActiveGiveaways(guildId) {
  const data = loadGiveaways();

  if (!Array.isArray(data[guildId])) {
    data[guildId] = [];
    saveGiveaways(data);
  }

  return data[guildId];
}

function createGiveaway(guildId, giveawayData) {
  const data = loadGiveaways();

  if (!Array.isArray(data[guildId])) {
    data[guildId] = [];
  }

  const giveaway = {
    id: `gw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: giveawayData.name,
    reward: giveawayData.reward,
    invitesRequired: giveawayData.invitesRequired,
    description: giveawayData.description || 'Aucune description.',
    createdBy: giveawayData.createdBy,
    createdByTag: giveawayData.createdByTag,
    createdAt: giveawayData.createdAt || new Date().toISOString()
  };

  data[guildId].push(giveaway);
  saveGiveaways(data);

  return giveaway;
}

function deleteGiveaway(guildId, giveawayId) {
  const data = loadGiveaways();

  if (!Array.isArray(data[guildId])) {
    return false;
  }

  const before = data[guildId].length;

  data[guildId] = data[guildId].filter(giveaway => giveaway.id !== giveawayId);

  saveGiveaways(data);

  return data[guildId].length !== before;
}

function resetGiveaways(guildId) {
  const data = loadGiveaways();

  data[guildId] = [];
  saveGiveaways(data);

  return true;
}

module.exports = {
  loadGiveaways,
  saveGiveaways,
  getActiveGiveaways,
  createGiveaway,
  deleteGiveaway,
  resetGiveaways
};