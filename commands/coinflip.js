const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Joue à pile ou face'),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Pile' : 'Face';
    await interaction.reply(`🪙 Résultat : **${result}**`);
  }
};