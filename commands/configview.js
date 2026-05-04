const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { getServerConfig } = require('../utils/serverConfig');

function formatChannel(id) {
  return id ? `<#${id}>` : 'Non configuré';
}

function formatRole(id) {
  return id ? `<@&${id}>` : 'Non configuré';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configview')
    .setDescription('Affiche la configuration du serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configview')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const config = getServerConfig(interaction.guild.id);

    const logsText = Object.entries(config.logs)
      .map(([type, id]) => `**${type} :** ${formatChannel(id)}`)
      .join('\n');

    const notifText = Object.entries(config.notifRoles)
      .map(([type, id]) => `**${type} :** ${formatRole(id)}`)
      .join('\n');

    const ticketText = Object.entries(config.ticketCategories)
      .map(([type, id]) => `**${type} :** ${formatChannel(id)}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Configuration BorzBot')
      .setDescription(`Configuration du serveur **${interaction.guild.name}**`)
      .setColor(0x5865f2)
      .addFields(
        {
          name: '👮 Rôle staff',
          value: formatRole(config.staffRoleId)
        },
        {
          name: '📊 Logs',
          value: logsText || 'Aucun'
        },
        {
          name: '🔔 Rôles notifications',
          value: notifText || 'Aucun'
        },
        {
          name: '🎫 Catégories tickets',
          value: ticketText || 'Aucun'
        }
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};