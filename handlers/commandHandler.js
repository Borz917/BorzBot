const fs = require("fs");
const path = require("path");

function getCommandFiles(dir) {
  let results = [];

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getCommandFiles(fullPath));
    } else if (file.endsWith(".js")) {
      results.push(fullPath);
    }
  }

  return results;
}

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, "..", "commands");
  const commandFiles = getCommandFiles(commandsPath);

  for (const file of commandFiles) {
    const command = require(file);

    if (!command.data || !command.execute) {
      console.log(`⚠️ Commande ignorée : ${file}`);
      continue;
    }

    client.commands.set(command.data.name, command);
    console.log(`✅ Commande chargée : /${command.data.name}`);
  }
}

module.exports = {
  loadCommands
};