module.exports = {
  name: 'inviteDelete',

  async execute(invite, client) {
    try {
      const invites = await invite.guild.invites.fetch();

      client.invitesCache.set(
        invite.guild.id,
        new Map(invites.map(inv => [inv.code, inv.uses || 0]))
      );
    } catch (error) {
      console.error('Erreur inviteDelete :', error);
    }
  }
};