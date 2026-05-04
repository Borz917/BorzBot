const joins = new Map();

function addJoin(guildId, userId) {
  const now = Date.now();

  if (!joins.has(guildId)) {
    joins.set(guildId, []);
  }

  const list = joins.get(guildId);

  list.push({
    userId,
    time: now
  });

  joins.set(guildId, list);

  return list;
}

function getRecentJoins(guildId, intervalMs) {
  const now = Date.now();
  const list = joins.get(guildId) || [];

  const recent = list.filter(entry => now - entry.time <= intervalMs);

  joins.set(guildId, recent);

  return recent;
}

function clearJoins(guildId) {
  joins.delete(guildId);
}

module.exports = {
  addJoin,
  getRecentJoins,
  clearJoins
};