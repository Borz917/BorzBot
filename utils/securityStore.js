const spamMap = new Map();

function addMessage(userId) {
  const now = Date.now();

  if (!spamMap.has(userId)) {
    spamMap.set(userId, []);
  }

  const messages = spamMap.get(userId);

  messages.push(now);

  spamMap.set(userId, messages);

  return messages;
}

function getRecentMessages(userId, intervalMs) {
  const now = Date.now();
  const messages = spamMap.get(userId) || [];

  const recent = messages.filter(timestamp => now - timestamp <= intervalMs);

  spamMap.set(userId, recent);

  return recent;
}

function clearUser(userId) {
  spamMap.delete(userId);
}

module.exports = {
  addMessage,
  getRecentMessages,
  clearUser
};