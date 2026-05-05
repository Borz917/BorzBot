require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require('discord.js');

const requiredEnv = ['TOKEN', 'CLIENT_ID'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Variable .env manquante : ${key}`);
    process.exit(1);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User
  ]
});

client.commands = new Collection();

/* =========================
   CHARGEMENT COMMANDES
========================= */

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

    if (!command.data || !command.execute) {
      console.warn(`⚠️ Commande ignorée : ${file} — data ou execute manquant.`);
      continue;
    }

    client.commands.set(command.data.name, command);
    console.log(`✅ Commande chargée : ${command.data.name}`);
  } catch (error) {
    console.error(`❌ Erreur chargement commande ${file} :`, error);
  }
}

/* =========================
   CHARGEMENT EVENTS
========================= */

const eventsPath = path.join(__dirname, 'events');

if (!fs.existsSync(eventsPath)) {
  console.warn('⚠️ Dossier events introuvable.');
} else {
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);

    try {
      const event = require(filePath);

      if (!event.name || !event.execute) {
        console.warn(`⚠️ Event ignoré : ${file} — name ou execute manquant.`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(`✅ Event chargé : ${event.name}`);
    } catch (error) {
      console.error(`❌ Erreur chargement event ${file} :`, error);
    }
  }
}

/* =========================
   SÉCURITÉS PROCESS
========================= */

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled Rejection :', error);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception :', error);
});

process.on('uncaughtExceptionMonitor', error => {
  console.error('❌ Uncaught Exception Monitor :', error);
});

/* =========================
   LOGIN
========================= */

client.login(process.env.TOKEN);