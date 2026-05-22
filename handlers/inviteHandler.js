module.exports = async (client) => {
  client.invites = new Map();

  for (const guild of client.guilds.cache.values()) {
    const invites = await guild.invites.fetch().catch(() => null);

    if (invites) {
      client.invites.set(guild.id, invites);
    }
  }

  console.log("✅ Invitations chargées.");
};