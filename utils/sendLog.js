const { EmbedBuilder } = require('discord.js');
const logChannels = require('../config/logChannels');

async function sendLog(guild, type, title, description, color = 0x2b2d31) {
  try {
    const channelName = logChannels[type];
    if (!channelName) return;

    const channel = guild.channels.cache.find(
      c => c.name === channelName && c.isTextBased()
    );

    if (!channel) {
      console.log(`Salon de logs introuvable pour ${type}: ${channelName}`);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Erreur sendLog :', error);
  }
}

module.exports = sendLog;