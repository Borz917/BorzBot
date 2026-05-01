require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`✅ Commande chargée : ${command.data.name}`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Déploiement des commandes globales...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Commandes globales déployées.');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
  }
})();