const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'channelCreate',

  async execute(channel) {
    try {
      if (!channel.guild) return;

      await sendDiscordLog(
        channel.guild,
        'raid-logs',
        '📁 Salon créé',
        `**Nom :** ${channel.name}\n**ID :** ${channel.id}`,
        0x57f287
      );
    } catch (error) {
      console.error('Erreur channelCreate :', error);
    }
  }
};