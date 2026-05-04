const sendDiscordLog = require('../utils/sendDiscordLog');
const { addInvite } = require('../utils/inviteStore');
const { getServerConfig } = require('../utils/serverConfig');
const { addJoin, getRecentJoins, clearJoins } = require('../utils/raidStore');
const { lockServer, sendRaidAlert } = require('../utils/raidActions');

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

      const config = getServerConfig(member.guild.id);
      const raidConfig = config.raid;

      if (!raidConfig.enabled) return;

      addJoin(member.guild.id, member.id);

      const recentJoins = getRecentJoins(
        member.guild.id,
        raidConfig.intervalMs
      );

      if (recentJoins.length < raidConfig.joinsLimit) return;

      await sendRaidAlert(member.guild, member, recentJoins, raidConfig);

      if (raidConfig.action === 'lockdown') {
        await lockServer(member.guild, 'Raid détecté automatiquement');
      }

      if (raidConfig.action === 'kick') {
        for (const join of recentJoins) {
          const target = await member.guild.members.fetch(join.userId).catch(() => null);

          if (target && target.kickable) {
            await target.kick('Anti-raid BorzBot').catch(() => null);
          }
        }

        await sendDiscordLog(
          member.guild,
          'raid-logs',
          '👢 Anti-raid kick',
          `**Membres détectés :** ${recentJoins.length}\n**Action :** kick automatique`,
          0xed4245
        );
      }

      clearJoins(member.guild.id);
    } catch (error) {
      console.error('Erreur guildMemberAdd :', error);
    }
  }
};