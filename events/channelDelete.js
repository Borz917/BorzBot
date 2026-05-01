const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'channelDelete',

  async execute(channel) {
    try {
      if (!channel.guild) return;

      await sendDiscordLog(
        channel.guild,
        'raid-logs',
        '🗑️ Salon supprimé',
        `**Nom :** ${channel.name}\n**ID :** ${channel.id}`,
        0xed4245
      );
    } catch (error) {
      console.error('Erreur channelDelete :', error);
    }
  }
};