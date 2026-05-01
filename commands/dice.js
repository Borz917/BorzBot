const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Lance un dé'),

  async execute(interaction) {
    const result = Math.floor(Math.random() * 6) + 1;
    await interaction.reply(`🎲 Tu as fait : **${result}**`);
  }
};