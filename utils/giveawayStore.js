const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const giveawaysPath = path.join(dataDir, 'giveaways.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(giveawaysPath)) {
    fs.writeFileSync(giveawaysPath, '{}', 'utf8');
  }
}

function loadGiveaways() {
  ensureFile();

  try {
    return JSON.parse(fs.readFileSync(giveawaysPath, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function saveGiveaways(data) {
  ensureFile();
  fs.writeFileSync(giveawaysPath, JSON.stringify(data, null, 2), 'utf8');
}

function createGiveaway(guildId, giveaway) {
  const data = loadGiveaways();

  if (!data[guildId]) {
    data[guildId] = [];
  }

  data[guildId].push(giveaway);
  saveGiveaways(data);
}

function getActiveGiveaways(guildId) {
  const data = loadGiveaways();
  return data[guildId] || [];
}

function endGiveaway(guildId, giveawayId) {
  const data = loadGiveaways();

  if (!data[guildId]) return false;

  const before = data[guildId].length;

  data[guildId] = data[guildId].filter(g => g.id !== giveawayId);

  saveGiveaways(data);

  return data[guildId].length !== before;
}

module.exports = {
  createGiveaway,
  getActiveGiveaways,
  endGiveaway
};