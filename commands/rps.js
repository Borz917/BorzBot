const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Joue à pierre feuille ciseaux')
    .addStringOption(option =>
      option
        .setName('choix')
        .setDescription('Ton choix')
        .setRequired(true)
        .addChoices(
          { name: 'Pierre', value: 'pierre' },
          { name: 'Feuille', value: 'feuille' },
          { name: 'Ciseaux', value: 'ciseaux' }
        )
    ),

  async execute(interaction) {
    const userChoice = interaction.options.getString('choix');
    const choices = ['pierre', 'feuille', 'ciseaux'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = 'Tu as perdu 😭';

    if (userChoice === botChoice) result = 'Égalité 😐';
    if (
      (userChoice === 'pierre' && botChoice === 'ciseaux') ||
      (userChoice === 'feuille' && botChoice === 'pierre') ||
      (userChoice === 'ciseaux' && botChoice === 'feuille')
    ) {
      result = 'Tu as gagné 🎉';
    }

    await interaction.reply(
      `🎮 **Pierre Feuille Ciseaux**\n\n` +
      `Ton choix : **${userChoice}**\n` +
      `Choix du bot : **${botChoice}**\n\n` +
      `**${result}**`
    );
  }
};