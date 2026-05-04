const fs = require('fs');
const path = require('path');

const botRoot = path.join(__dirname, '..');
const dataDir = path.join(botRoot, 'data');

function readJsonFile(fileName) {
  const filePath = path.join(dataDir, fileName);

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
    console.error(`Erreur lecture ${fileName} :`, error.message);
    return {};
  }
}

function getDashboardData() {
  return {
    warns: readJsonFile('warns.json'),
    staffStats: readJsonFile('staffStats.json'),
    invites: readJsonFile('invites.json'),
    giveaways: readJsonFile('giveaways.json'),
    serverConfigs: readJsonFile('serverConfigs.json')
  };
}

module.exports = {
  readJsonFile,
  getDashboardData
};