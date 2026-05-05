const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

const choices = {
  pierre: '🪨 Pierre',
  feuille: '📄 Feuille',
  ciseaux: '✂️ Ciseaux'
};

function getWinner(player, bot) {
  if (player === bot) return 'draw';

  if (
    (player === 'pierre' && bot === 'ciseaux') ||
    (player === 'feuille' && bot === 'pierre') ||
    (player === 'ciseaux' && bot === 'feuille')
  ) {
    return 'player';
  }

  return 'bot';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Jouer à pierre, feuille, ciseaux contre le bot')
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
    if (!hasPermission(interaction.member, 'rps')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/rps`.',
        ephemeral: true
      });
    }

    const playerChoice = interaction.options.getString('choix');
    const botChoice = ['pierre', 'feuille', 'ciseaux'][Math.floor(Math.random() * 3)];

    const winner = getWinner(playerChoice, botChoice);

    let resultText = 'Égalité 😐';
    let color = 0x99aab5;

    if (winner === 'player') {
      resultText = 'Tu as gagné 🎉';
      color = 0x57f287;
    }

    if (winner === 'bot') {
      resultText = 'Tu as perdu 😭';
      color = 0xed4245;
    }

    const embed = new EmbedBuilder()
      .setTitle('🎮 Pierre Feuille Ciseaux')
      .setDescription(
        `**Ton choix :** ${choices[playerChoice]}\n` +
        `**Choix du bot :** ${choices[botChoice]}\n\n` +
        `**Résultat :** ${resultText}`
      )
      .setColor(color)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};