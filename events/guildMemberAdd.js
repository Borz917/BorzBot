const sendDiscordLog = require('../utils/sendDiscordLog');
const { addInvite } = require('../utils/inviteStore');
const { getServerConfig } = require('../utils/serverConfig');
const { addJoin, getRecentJoins, clearJoins } = require('../utils/raidStore');
const { lockGuild } = require('../utils/raidLockHelper');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member, client) {
    try {
      if (!member.guild) return;

      let inviterText = 'Invitation inconnue';

      // =========================
      // INVITE TRACKING
      // =========================
      try {
        if (!client.invitesCache) {
          client.invitesCache = new Map();
        }

        const oldInvites = client.invitesCache.get(member.guild.id) || new Map();
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

      // =========================
      // LOG ARRIVÉE MEMBRE
      // =========================
      await sendDiscordLog(
        member.guild,
        'moderation-logs',
        '📥 Nouveau membre',
        `**Utilisateur :** ${member.user.tag}\n` +
        `**ID :** \`${member.id}\`\n` +
        `**Invité par :** ${inviterText}\n` +
        `**Compte créé :** <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>\n` +
        `**Depuis :** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n` +
        `**Nombre de membres :** ${member.guild.memberCount}`,
        0x57f287
      );

      // =========================
      // ANTI-RAID
      // =========================
      const config = getServerConfig(member.guild.id);
      const raidConfig = config.raid || {};

      if (!raidConfig.enabled) return;

      addJoin(member.guild.id, member.id);

      const recentJoins = getRecentJoins(
        member.guild.id,
        raidConfig.intervalMs || 60 * 1000
      );

      if (recentJoins.length < (raidConfig.joinsLimit || 5)) return;

      const action = raidConfig.action || 'alert';

      await sendDiscordLog(
        member.guild,
        'raid-logs',
        '🚨 Raid détecté',
        `**Membres récents :** ${recentJoins.length}\n` +
        `**Limite :** ${raidConfig.joinsLimit || 5}\n` +
        `**Intervalle :** ${(raidConfig.intervalMs || 60000) / 1000}s\n` +
        `**Action :** \`${action}\`\n` +
        `**Dernier membre :** ${member.user.tag} (${member.id})`,
        0xed4245
      );

      if (action === 'alert') {
        clearJoins(member.guild.id);
        return;
      }

      if (action === 'lock' || action === 'lockdown') {
        await lockGuild(
          member.guild,
          'Système anti-raid',
          'Raid détecté automatiquement'
        );

        clearJoins(member.guild.id);
        return;
      }

      if (action === 'kick') {
        let kickedCount = 0;
        let failedCount = 0;

        for (const join of recentJoins) {
          const target = await member.guild.members.fetch(join.userId).catch(() => null);

          if (!target) {
            failedCount++;
            continue;
          }

          if (!target.kickable) {
            failedCount++;
            continue;
          }

          await target.kick('Anti-raid BorzBot').then(() => {
            kickedCount++;
          }).catch(() => {
            failedCount++;
          });
        }

        await sendDiscordLog(
          member.guild,
          'raid-logs',
          '👢 Anti-raid kick',
          `**Membres détectés :** ${recentJoins.length}\n` +
          `**Membres kick :** ${kickedCount}\n` +
          `**Échecs :** ${failedCount}`,
          0xed4245
        );

        clearJoins(member.guild.id);
        return;
      }

      clearJoins(member.guild.id);
    } catch (error) {
      console.error('Erreur guildMemberAdd :', error);
    }
  }
};