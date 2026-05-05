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
    .setDescription('Voir la configuration actuelle du serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configview')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/configview`.',
        ephemeral: true
      });
    }

    const config = getServerConfig(interaction.guild.id);

    const logsText =
      `**Modération :** ${formatChannel(config.logs?.moderation)}\n` +
      `**Vocal :** ${formatChannel(config.logs?.voice)}\n` +
      `**Messages :** ${formatChannel(config.logs?.messages)}\n` +
      `**Boost :** ${formatChannel(config.logs?.boost)}\n` +
      `**Rôles :** ${formatChannel(config.logs?.roles)}\n` +
      `**Raid :** ${formatChannel(config.logs?.raid)}\n` +
      `**Support :** ${formatChannel(config.logs?.support)}`;

    const notifText =
      `**Illégal :** ${formatRole(config.notifRoles?.illegal)}\n` +
      `**Légal :** ${formatRole(config.notifRoles?.legal)}\n` +
      `**Giveaways :** ${formatRole(config.notifRoles?.giveaways)}\n` +
      `**Événement :** ${formatRole(config.notifRoles?.evenement)}`;

    const ticketsText =
      `**Boutique :** ${formatChannel(config.ticketCategories?.boutique)}\n` +
      `**Support :** ${formatChannel(config.ticketCategories?.support)}\n` +
      `**Recrutement :** ${formatChannel(config.ticketCategories?.recrutement)}\n` +
      `**Illégal :** ${formatChannel(config.ticketCategories?.illegal)}\n` +
      `**Légal :** ${formatChannel(config.ticketCategories?.legal)}\n` +
      `**Unban :** ${formatChannel(config.ticketCategories?.unban)}\n` +
      `**Fonda :** ${formatChannel(config.ticketCategories?.fonda)}\n` +
      `**Plainte Staff :** ${formatChannel(config.ticketCategories?.plainte_staff)}`;

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Configuration BorzBot')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '👮 Rôle staff',
          value: formatRole(config.staffRoleId),
          inline: false
        },
        {
          name: '📋 Salons logs',
          value: logsText,
          inline: false
        },
        {
          name: '🔔 Rôles notifications',
          value: notifText,
          inline: false
        },
        {
          name: '🎫 Catégories tickets',
          value: ticketsText,
          inline: false
        }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};