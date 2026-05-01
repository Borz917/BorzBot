const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const invitesPath = path.join(dataDir, 'invites.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(invitesPath)) {
    fs.writeFileSync(invitesPath, '{}', 'utf8');
  }
}

function loadInvites() {
  ensureFile();

  try {
    return JSON.parse(fs.readFileSync(invitesPath, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function saveInvites(data) {
  ensureFile();
  fs.writeFileSync(invitesPath, JSON.stringify(data, null, 2), 'utf8');
}

function addInvite(guildId, inviterId, invitedUserId) {
  const data = loadInvites();

  if (!data[guildId]) {
    data[guildId] = {};
  }

  if (!data[guildId][inviterId]) {
    data[guildId][inviterId] = {
      total: 0,
      users: []
    };
  }

  if (!data[guildId][inviterId].users.includes(invitedUserId)) {
    data[guildId][inviterId].total += 1;
    data[guildId][inviterId].users.push(invitedUserId);
  }

  saveInvites(data);
}

function getUserInvites(guildId, userId) {
  const data = loadInvites();

  return data[guildId]?.[userId] || {
    total: 0,
    users: []
  };
}

function getGuildInvites(guildId) {
  const data = loadInvites();
  return data[guildId] || {};
}

function resetUserInvites(guildId, userId) {
  const data = loadInvites();

  if (data[guildId]?.[userId]) {
    delete data[guildId][userId];
    saveInvites(data);
  }
}

module.exports = {
  addInvite,
  getUserInvites,
  getGuildInvites,
  resetUserInvites
};