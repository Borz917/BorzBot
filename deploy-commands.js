require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

function files(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) out = out.concat(files(p));
    else if (f.endsWith(".js")) out.push(p);
  }
  return out;
}

(async () => {
  const commands = [];
  for (const file of files(path.join(__dirname, "commands"))) {
    const cmd = require(file);
    if (cmd.data && cmd.execute) commands.push(cmd.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  console.log(`✅ ${commands.length} commandes slash globales déployées.`);
})();
