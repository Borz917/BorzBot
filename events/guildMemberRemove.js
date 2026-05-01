const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  name: 'guildMemberRemove',

  async execute(member) {
    try {
      await sendDiscordLog(
        member.guild,
        'raid-logs',
        '➖ Membre parti',
        `**Utilisateur :** ${member.user.tag}\n**ID :** ${member.id}`,
        0xed4245
      );
    } catch (error) {
      console.error('Erreur guildMemberRemove :', error);
    }
  }
};