require('dotenv').config();

const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    if (!process.env.TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
      console.log('❌ TOKEN, CLIENT_ID ou GUILD_ID manquant dans le .env');
      return;
    }

    console.log('🧹 Suppression des commandes guild...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] }
    );

    console.log('✅ Commandes guild supprimées.');
  } catch (error) {
    console.error('❌ Erreur suppression guild commands :', error);
  }
})();