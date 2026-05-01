const sendDiscordLog = require('../utils/sendDiscordLog');
const { addInvite } = require('../utils/inviteStore');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member, client) {
    try {
      let inviterText = 'Invitation inconnue';

      try {
        const oldInvites = client.invitesCache?.get(member.guild.id) || new Map();
        const newInvites = await member.guild.invites.fetch();

        const usedInvite = newInvites.find(invite => {
          const oldUses = oldInvites.get(invite.code) || 0;
          return (invite.uses || 0) > oldUses;
        });

        client.invitesCache.set(
          member.guild.id,
          new Map(newInvites.map(invite => [invite.code, invite.uses || 0]))
        );

        if (usedInvite?.inviter) {
          addInvite(member.guild.id, usedInvite.inviter.id, member.id);
          inviterText = `${usedInvite.inviter.tag} (${usedInvite.inviter.id})`;
        }
      } catch (error) {
        console.log('Erreur invite tracking :', error.message);
      }

      await sendDiscordLog(
        member.guild,
        'raid-logs',
        '➕ Nouveau membre',
        `**Utilisateur :** ${member.user.tag}\n` +
        `**ID :** ${member.id}\n` +
        `**Invité par :** ${inviterText}`,
        0x57f287
      );
    } catch (error) {
      console.error('Erreur guildMemberAdd :', error);
    }
  }
};