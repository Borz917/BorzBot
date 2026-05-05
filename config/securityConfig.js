module.exports = {
  antiSpam: {
    enabled: true,
    maxMessages: 5,
    intervalMs: 7000,
    timeoutMs: 10 * 60 * 1000,
    deleteMessages: true
  },

  antiLink: {
    enabled: true,
    deleteMessage: true,
    timeoutMs: 5 * 60 * 1000,

    allowedDomains: [
      'discord.gg',
      'discord.com',
      'youtube.com',
      'youtu.be',
      'tiktok.com'
    ]
  },

  ignoredRoles: [
    'Équipe STAFF',
    'Main Team',
    'Gérant Staff',
    'Gérant Global',
    'Responsable Staff'
  ],

  logChannelName: 'moderation-logs'
};