const { Events } = require('discord.js');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member) {
    try {
      const joinedAt = member.joinedTimestamp
        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
        : 'Inconnu';

      await sendDiscordLog(
        member.guild,
        'moderation-logs',
        '📤 Membre parti',
        `**Membre :** ${member.user.tag}\n` +
        `**ID :** \`${member.id}\`\n` +
        `**Avait rejoint :** ${joinedAt}\n` +
        `**Nombre de membres :** ${member.guild.memberCount}`,
        0xed4245
      );
    } catch (error) {
      console.error('Erreur guildMemberRemove :', error);
    }
  }
};