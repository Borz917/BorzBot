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
    .setDescription('Défier un membre en pierre-feuille-ciseaux')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à défier')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('mode')
        .setDescription('Mode du duel')
        .setRequired(false)
        .addChoices(
          { name: 'Fun', value: 'fun' },
          { name: 'Ranked', value: 'ranked' }
        )
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'duel')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/duel`.',
        ephemeral: true
      });
    }

    const opponent = interaction.options.getUser('membre');
    const mode = interaction.options.getString('mode') || 'fun';

    if (opponent.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Tu ne peux pas te défier toi-même.',
        ephemeral: true
      });
    }

    if (opponent.bot) {
      return interaction.reply({
        content: '❌ Tu ne peux pas défier un bot.',
        ephemeral: true
      });
    }

    const duel = createDuel({
      guildId: interaction.guild.id,
      challengerId: interaction.user.id,
      challengerTag: interaction.user.tag,
      opponentId: opponent.id,
      opponentTag: opponent.tag,
      mode
    });

    const embed = new EmbedBuilder()
      .setTitle('⚔️ Duel proposé')
      .setDescription(
        `${opponent}, tu as été défié par ${interaction.user}.\n\n` +
        `**Mode :** ${mode === 'ranked' ? 'Ranked 🏆' : 'Fun 🎮'}\n\n` +
        `Tu peux accepter ou refuser le duel.`
      )
      .setColor(mode === 'ranked' ? 0xfaa61a : 0x5865f2)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`duel_accept_${duel.id}`)
        .setLabel('Accepter')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`duel_decline_${duel.id}`)
        .setLabel('Refuser')
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      content: `${opponent}`,
      embeds: [embed],
      components: [row]
    });
  }
};