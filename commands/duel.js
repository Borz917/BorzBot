const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const hasPermission = require('../utils/hasPermission');
const { createDuel } = require('../utils/duelStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duel')
    .setDescription('Défie un joueur en 1vs1')
    .addUserOption(option =>
      option.setName('adversaire')
        .setDescription('Joueur à défier')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('jeu')
        .setDescription('Jeu du duel')
        .setRequired(true)
        .addChoices(
          { name: 'Pierre Feuille Ciseaux', value: 'rps' }
        )
    )
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Mode du duel')
        .setRequired(true)
        .addChoices(
          { name: 'Fun', value: 'fun' },
          { name: 'Ranked', value: 'ranked' }
        )
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'duel')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const opponent = interaction.options.getUser('adversaire');
    const game = interaction.options.getString('jeu');
    const mode = interaction.options.getString('mode');

    if (opponent.bot) {
      return interaction.reply({
        content: '❌ Tu ne peux pas défier un bot.',
        ephemeral: true
      });
    }

    if (opponent.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Tu ne peux pas te défier toi-même.',
        ephemeral: true
      });
    }

    const duelId = `${interaction.user.id}_${opponent.id}_${Date.now()}`;

    createDuel(duelId, {
      id: duelId,
      challengerId: interaction.user.id,
      opponentId: opponent.id,
      game,
      mode,
      status: 'pending',
      choices: {}
    });

    const embed = new EmbedBuilder()
      .setTitle('⚔️ Duel 1vs1')
      .setDescription(
        `${opponent}, tu as été défié par ${interaction.user}.\n\n` +
        `**Jeu :** Pierre Feuille Ciseaux\n` +
        `**Mode :** ${mode === 'ranked' ? 'Ranked 🏆' : 'Fun 🎮'}`
      )
      .setColor(mode === 'ranked' ? 0xfaa61a : 0x5865f2)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`duel_accept_${duelId}`)
        .setLabel('Accepter')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`duel_decline_${duelId}`)
        .setLabel('Refuser')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `${opponent}`,
      embeds: [embed],
      components: [row]
    });
  }
};