const Warn = require("../models/Warn");

async function addWarn(guildId, userId, moderatorId, reason) {
  return Warn.create({
    guildId,
    userId,
    moderatorId,
    reason
  });
}

async function activeWarnCount(guildId, userId) {
  return Warn.countDocuments({
    guildId,
    userId,
    active: true
  });
}

module.exports = {
  addWarn,
  activeWarnCount
};