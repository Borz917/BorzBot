const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Affiche les informations du serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'serverinfo')) {
      return interaction.reply({ content: '❌ Tu n’as pas la permission.', ephemeral: true });
    }

    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle('🏠 Informations serveur')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setColor(0x5865f2)
      .addFields(
        { name: 'Nom', value: guild.name, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Membres', value: `${guild.memberCount}`, inline: true },
        { name: 'Salons', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>` }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};