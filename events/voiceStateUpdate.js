const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'voiceStateUpdate',

  async execute(oldState, newState) {
    try {
      const member = newState.member || oldState.member;
      if (!member || member.user.bot) return;

      if (!oldState.channelId && newState.channelId) {
        return sendDiscordLog(
          member.guild,
          'voice-logs',
          '🎤 Connexion vocale',
          `**Membre :** ${member.user.tag}\n**Salon :** <#${newState.channelId}>`,
          0x57f287
        );
      }

      if (oldState.channelId && !newState.channelId) {
        return sendDiscordLog(
          member.guild,
          'voice-logs',
          '📤 Déconnexion vocale',
          `**Membre :** ${member.user.tag}\n**Salon :** <#${oldState.channelId}>`,
          0xed4245
        );
      }

      if (oldState.channelId !== newState.channelId) {
        return sendDiscordLog(
          member.guild,
          'voice-logs',
          '🔁 Changement de vocal',
          `**Membre :** ${member.user.tag}\n**Avant :** <#${oldState.channelId}>\n**Après :** <#${newState.channelId}>`,
          0x5865f2
        );
      }
    } catch (error) {
      console.error('Erreur voiceStateUpdate :', error);
    }
  }
};