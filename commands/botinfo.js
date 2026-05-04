const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Affiche les informations du bot'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'botinfo')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const client = interaction.client;

    const embed = new EmbedBuilder()
      .setTitle('🤖 Informations BorzBot')
      .setThumbnail(client.user.displayAvatarURL())
      .setColor(0x5865f2)
      .addFields(
        {
          name: 'Nom',
          value: `${client.user.tag}`,
          inline: true
        },
        {
          name: 'ID',
          value: `${client.user.id}`,
          inline: true
        },
        {
          name: 'Serveurs',
          value: `${client.guilds.cache.size}`,
          inline: true
        },
        {
          name: 'Utilisateurs visibles',
          value: `${client.users.cache.size}`,
          inline: true
        },
        {
          name: 'Ping',
          value: `${client.ws.ping}ms`,
          inline: true
        },
        {
          name: 'Version',
          value: 'BorzBot v1.0',
          inline: true
        },
        {
          name: 'Fonctionnalités',
          value:
            '🔨 Modération\n' +
            '🎫 Tickets\n' +
            '📊 Logs\n' +
            '🎮 Mini-jeux ranked\n' +
            '📨 Invitations\n' +
            '📢 Annonces'
        }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};