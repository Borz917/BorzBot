function limitText(text, max = 1000) {
  const value = String(text || '');

  if (value.length <= max) return value;

  return value.slice(0, max) + '...';
}

function formatUser(user) {
  if (!user) return 'Inconnu';

  return `${user.tag || user.username || 'Utilisateur inconnu'} (${user.id})`;
}

function formatChannel(channel) {
  if (!channel) return 'Inconnu';

  return `${channel.name || 'Salon inconnu'} (${channel.id})`;
}

function formatRole(role) {
  if (!role) return 'Inconnu';

  return `${role.name || 'Rôle inconnu'} (${role.id})`;
}

function formatDate(date = new Date()) {
  return `<t:${Math.floor(date.getTime() / 1000)}:F>`;
}

module.exports = {
  limitText,
  formatUser,
  formatChannel,
  formatRole,
  formatDate
};