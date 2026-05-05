const fs = require('fs');
const path = require('path');

const dataDir = process.env.BOT_DATA_PATH || path.join(__dirname, '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getFilePath(fileName) {
  ensureDataDir();
  return path.join(dataDir, fileName);
}

function readJsonFile(fileName) {
  const filePath = getFilePath(fileName);

  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }

    const content = fs.readFileSync(filePath, 'utf8');

    if (!content.trim()) {
      return {};
    }

    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Erreur lecture ${fileName} :`, error.message);
    return {};
  }
}

function writeJsonFile(fileName, data) {
  const filePath = getFilePath(fileName);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Erreur écriture ${fileName} :`, error.message);
    return false;
  }
}

function getDashboardData() {
  return {
    warns: readJsonFile('warns.json'),
    staffStats: readJsonFile('staffStats.json'),
    invites: readJsonFile('invites.json'),
    giveaways: readJsonFile('giveaways.json'),
    serverConfigs: readJsonFile('serverConfigs.json'),
    dashboardLogs: readJsonFile('dashboardLogs.json')
  };
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  getDashboardData
};