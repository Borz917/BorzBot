const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const logsPath = path.join(dataDir, 'dashboardLogs.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(logsPath)) {
    fs.writeFileSync(logsPath, '{}', 'utf8');
  }
}

function loadLogs() {
  ensureFile();

  try {
    return JSON.parse(fs.readFileSync(logsPath, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function saveLogs(data) {
  ensureFile();
  fs.writeFileSync(logsPath, JSON.stringify(data, null, 2), 'utf8');
}

function saveDashboardLog(guildId, type, title, description, color = 0x5865f2) {
  const data = loadLogs();

  if (!data[guildId]) {
    data[guildId] = [];
  }

  data[guildId].unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    description,
    color,
    createdAt: new Date().toISOString()
  });

  data[guildId] = data[guildId].slice(0, 500);

  saveLogs(data);
}

function getDashboardLogs(guildId = null) {
  const data = loadLogs();

  if (guildId) {
    return data[guildId] || [];
  }

  return data;
}

function clearDashboardLogs(guildId = null) {
  const data = loadLogs();

  if (guildId) {
    delete data[guildId];
  } else {
    for (const key of Object.keys(data)) {
      delete data[key];
    }
  }

  saveLogs(data);
}

module.exports = {
  saveDashboardLog,
  getDashboardLogs,
  clearDashboardLogs
};