const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const warnsPath = path.join(dataDir, 'warns.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(warnsPath)) fs.writeFileSync(warnsPath, '{}', 'utf8');
}

function loadWarns() {
  ensureFile();
  return JSON.parse(fs.readFileSync(warnsPath, 'utf8') || '{}');
}

function saveWarns(data) {
  ensureFile();
  fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2), 'utf8');
}

function addWarn(userId, reason, moderatorId = null) {
  const warns = loadWarns();

  if (!warns[userId]) warns[userId] = [];

  warns[userId].push({
    reason,
    moderatorId,
    date: new Date().toISOString()
  });

  saveWarns(warns);
}

function getWarns(userId) {
  const warns = loadWarns();
  return warns[userId] || [];
}

function removeWarn(userId, index) {
  const warns = loadWarns();

  if (!warns[userId]) return false;
  if (index < 0 || index >= warns[userId].length) return false;

  warns[userId].splice(index, 1);

  if (warns[userId].length === 0) {
    delete warns[userId];
  }

  saveWarns(warns);
  return true;
}

function clearWarns(userId) {
  const warns = loadWarns();
  delete warns[userId];
  saveWarns(warns);
}

module.exports = {
  addWarn,
  getWarns,
  removeWarn,
  clearWarns
};