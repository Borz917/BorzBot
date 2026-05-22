require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const mongoose = require("mongoose");
const { loadCommands } = require("./handlers/commandHandler");
const { loadEvents } = require("./handlers/eventHandler");
const logger = require("./utils/logger");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
});

client.commands = new Collection();

(async () => {
  if (!process.env.TOKEN) return logger.error("TOKEN manquant dans .env");

  if (process.env.MONGO_URI && !process.env.MONGO_URI.includes("TON_MONGO_URI")) {
    await mongoose.connect(process.env.MONGO_URI).then(() => logger.success("MongoDB connecté")).catch(err => logger.error(err.message));
  } else {
    logger.warn("MONGO_URI non configuré");
  }

  await loadCommands(client);
  await loadEvents(client);
  await client.login(process.env.TOKEN);
})();
