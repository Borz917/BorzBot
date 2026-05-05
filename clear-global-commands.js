require('dotenv').config();

const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    if (!process.env.CLIENT_ID) {
      console.error('❌ CLIENT_ID manquant dans le .env');
      process.exit(1);
    }

    console.log('🧹 Suppression des commandes globales...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );

    console.log('✅ Commandes globales supprimées.');
    console.log('⚠️ Discord peut mettre quelques minutes à actualiser l’affichage.');
  } catch (error) {
    console.error('❌ Erreur suppression commandes globales :', error);
  }
})();