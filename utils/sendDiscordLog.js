const { EmbedBuilder } = require('discord.js');

async function sendDiscordLog(guild, channelName, title, description, color = 0x5865f2) {
  try {
    const channel = guild.channels.cache.find(
      c => c.name === channelName && c.isTextBased()
    );

    if (!channel) {
      console.log(`Salon de logs introuvable : ${channelName}`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Erreur sendDiscordLog :', error);
  }
}

module.exports = sendDiscordLog;