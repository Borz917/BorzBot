const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Obtenir le lien d’invitation du bot'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'invite')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/invite`.',
        ephemeral: true
      });
    }

    const clientId = process.env.CLIENT_ID || interaction.client.user.id;

    const permissions =
      PermissionFlagsBits.Administrator;

    const inviteUrl =
      `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&integration_type=0&scope=bot+applications.commands`;

    const embed = new EmbedBuilder()
      .setTitle('🔗 Inviter BorzBot')
      .setDescription(
        `Clique sur le bouton/lien ci-dessous pour inviter le bot sur ton serveur.\n\n` +
        `[📩 Inviter BorzBot](${inviteUrl})`
      )
      .setColor(0x5865f2)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};