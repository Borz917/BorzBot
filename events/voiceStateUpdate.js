const { Events } = require('discord.js');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: Events.VoiceStateUpdate,

  async execute(oldState, newState) {
    try {
      const member = newState.member || oldState.member;
      if (!member || member.user.bot) return;

      const guild = newState.guild || oldState.guild;

      if (!oldState.channelId && newState.channelId) {
        return sendDiscordLog(
          guild,
          'voice-logs',
          '🔊 Connexion vocale',
          `**Membre :** ${member.user.tag} (${member.id})\n` +
          `**Salon :** ${newState.channel}`,
          0x57f287
        );
      }

      if (oldState.channelId && !newState.channelId) {
        return sendDiscordLog(
          guild,
          'voice-logs',
          '🔇 Déconnexion vocale',
          `**Membre :** ${member.user.tag} (${member.id})\n` +
          `**Salon :** ${oldState.channel}`,
          0xed4245
        );
      }

      if (oldState.channelId !== newState.channelId) {
        return sendDiscordLog(
          guild,
          'voice-logs',
          '🔁 Changement de salon vocal',
          `**Membre :** ${member.user.tag} (${member.id})\n` +
          `**Avant :** ${oldState.channel}\n` +
          `**Après :** ${newState.channel}`,
          0xfaa61a
        );
      }

      const changes = [];

      if (oldState.selfMute !== newState.selfMute) {
        changes.push(`**Micro perso :** ${newState.selfMute ? 'Mute' : 'Unmute'}`);
      }

      if (oldState.selfDeaf !== newState.selfDeaf) {
        changes.push(`**Casque perso :** ${newState.selfDeaf ? 'Sourdine' : 'Activé'}`);
      }

      if (oldState.serverMute !== newState.serverMute) {
        changes.push(`**Micro serveur :** ${newState.serverMute ? 'Mute' : 'Unmute'}`);
      }

      if (oldState.serverDeaf !== newState.serverDeaf) {
        changes.push(`**Casque serveur :** ${newState.serverDeaf ? 'Sourdine' : 'Activé'}`);
      }

      if (!changes.length) return;

      await sendDiscordLog(
        guild,
        'voice-logs',
        '🎙️ État vocal modifié',
        `**Membre :** ${member.user.tag} (${member.id})\n` +
        `**Salon :** ${newState.channel || oldState.channel}\n\n` +
        changes.join('\n'),
        0x5865f2
      );
    } catch (error) {
      console.error('Erreur voiceStateUpdate :', error);
    }
  }
};