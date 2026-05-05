const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
    console.log(`🌐 Serveurs : ${client.guilds.cache.size}`);
    console.log(`⚙️ Commandes chargées : ${client.commands.size}`);

    client.user.setPresence({
      activities: [
        {
          name: 'Los Santos Stories',
          type: ActivityType.Watching
        }
      ],
      status: 'online'
    });
  }
};