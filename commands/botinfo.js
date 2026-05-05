const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];

  if (days > 0) parts.push(`${days}j`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length ? parts.join(' ') : 'Moins d’une minute';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Afficher les informations du bot'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'botinfo')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/botinfo`.',
        ephemeral: true
      });
    }

    const client = interaction.client;

    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const totalCommands = client.commands ? client.commands.size : 0;
    const ping = client.ws.ping;
    const uptime = formatUptime(client.uptime || 0);

    const embed = new EmbedBuilder()
      .setTitle('🤖 BorzBot • Informations')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor(0x5865f2)
      .addFields(
        {
          name: '📌 Bot',
          value:
            `**Nom :** ${client.user.tag}\n` +
            `**ID :** \`${client.user.id}\`\n` +
            `**Commandes chargées :** ${totalCommands}`,
          inline: false
        },
        {
          name: '📊 Statistiques',
          value:
            `**Serveurs :** ${totalGuilds}\n` +
            `**Utilisateurs visibles :** ${totalUsers}\n` +
            `**Ping :** ${ping}ms\n` +
            `**Uptime :** ${uptime}`,
          inline: false
        },
        {
          name: '🧩 Systèmes',
          value:
            `✅ Modération\n` +
            `✅ Tickets\n` +
            `✅ Logs\n` +
            `✅ Mini-jeux\n` +
            `✅ Invitations\n` +
            `✅ Sécurité\n` +
            `✅ Dashboard`,
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