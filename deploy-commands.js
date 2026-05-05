require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const requiredEnv = ['TOKEN', 'CLIENT_ID'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Variable .env manquante : ${key}`);
    process.exit(1);
  }
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
  console.error('❌ Dossier commands introuvable.');
  process.exit(1);
}

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);

  try {
    const command = require(filePath);

    if (!command.data || !command.data.toJSON) {
      console.warn(`⚠️ Commande ignorée : ${file} — data.toJSON manquant.`);
      continue;
    }

    commands.push(command.data.toJSON());
    console.log(`✅ Commande chargée : ${command.data.name}`);
  } catch (error) {
    console.error(`❌ Erreur dans ${file} :`, error);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 Déploiement de ${commands.length} commande(s)...`);

    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );

      console.log('✅ Commandes déployées sur le serveur de test.');
      console.log(`📌 GUILD_ID : ${process.env.GUILD_ID}`);
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );

      console.log('✅ Commandes globales déployées.');
      console.log('⚠️ Les commandes globales peuvent mettre plusieurs minutes à apparaître.');
    }
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
  }
})();