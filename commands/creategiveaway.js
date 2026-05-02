const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { createGiveaway } = require('../utils/giveawayStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('creategiveaway')
    .setDescription('Créer un giveaway visible dans le panel invitations')
    .addStringOption(option =>
      option
        .setName('nom')
        .setDescription('Nom du giveaway')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('recompense')
        .setDescription('Récompense du giveaway')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('invites')
        .setDescription('Nombre d’invitations nécessaires')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'creategiveaway')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const name = interaction.options.getString('nom');
    const reward = interaction.options.getString('recompense');
    const invitesRequired = interaction.options.getInteger('invites');

    const giveawayId = Date.now().toString();

    createGiveaway(interaction.guild.id, {
      id: giveawayId,
      name,
      reward,
      invitesRequired,
      createdBy: interaction.user.id,
      createdAt: new Date().toISOString()
    });

    await interaction.reply({
      content:
        `✅ Giveaway créé.\n\n` +
        `**ID :** \`${giveawayId}\`\n` +
        `**Nom :** ${name}\n` +
        `**Récompense :** ${reward}\n` +
        `**Invitations nécessaires :** ${invitesRequired}`,
      ephemeral: true
    });
  }
};