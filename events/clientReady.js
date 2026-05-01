const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    client.invitesCache = new Map();

    for (const guild of client.guilds.cache.values()) {
      try {
        const invites = await guild.invites.fetch();

        client.invitesCache.set(
          guild.id,
          new Map(invites.map(invite => [invite.code, invite.uses || 0]))
        );

        console.log(`✅ Invitations chargées pour ${guild.name}`);
      } catch (error) {
        console.log(`❌ Impossible de charger les invitations pour ${guild.name}`);
      }
    }
  }
};