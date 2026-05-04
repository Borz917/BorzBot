const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const botConfig = require('../config/botConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Affiche le lien d’invitation du bot'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'invite')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const clientId = interaction.client.user.id;

    const inviteLink =
      `https://discord.com/oauth2/authorize?client_id=${clientId}` +
      `&permissions=${botConfig.invitePermissions}` +
      `&integration_type=0&scope=bot+applications.commands`;

    const embed = new EmbedBuilder()
      .setTitle('🔗 Inviter BorzBot')
      .setDescription(
        'Clique sur le bouton ci-dessous pour inviter BorzBot sur ton serveur.\n\n' +
        'Le bot aura besoin des permissions nécessaires pour gérer les logs, tickets, rôles et commandes.'
      )
      .setColor(0x5865f2)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Inviter le bot')
        .setStyle(ButtonStyle.Link)
        .setURL(inviteLink)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};