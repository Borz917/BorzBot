const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const filePath = path.join(dataDir, 'tickets.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2), 'utf8');
  }
}

function loadTickets() {
  ensureFile();

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Erreur lecture tickets.json :', error);
    return {};
  }
}

function saveTickets(tickets) {
  ensureFile();

  try {
    fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2), 'utf8');
  } catch (error) {
    console.error('Erreur écriture tickets.json :', error);
  }
}

function setTicket(userId, data) {
  const tickets = loadTickets();
  tickets[userId] = data;
  saveTickets(tickets);
}

function getTicket(userId) {
  const tickets = loadTickets();
  return tickets[userId] || null;
}

function deleteTicket(userId) {
  const tickets = loadTickets();
  delete tickets[userId];
  saveTickets(tickets);
}

function findTicketByChannelId(channelId) {
  const tickets = loadTickets();

  for (const [userId, data] of Object.entries(tickets)) {
    if (data.channelId === channelId) {
      return { userId, ...data };
    }
  }

  return null;
}

function getAllTickets() {
  return loadTickets();
}

function deleteTicketByChannelId(channelId) {
  const tickets = loadTickets();
  let deleted = false;

  for (const [userId, data] of Object.entries(tickets)) {
    if (data.channelId === channelId) {
      delete tickets[userId];
      deleted = true;
      break;
    }
  }

  if (deleted) {
    saveTickets(tickets);
  }

  return deleted;
}

module.exports = {
  setTicket,
  getTicket,
  deleteTicket,
  findTicketByChannelId,
  getAllTickets,
  deleteTicketByChannelId
};