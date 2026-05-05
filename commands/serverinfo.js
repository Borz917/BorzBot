const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

function formatDate(date) {
  if (!date) return 'Inconnue';
  return `<t:${Math.floor(date.getTime() / 1000)}:F>`;
}

function formatRelative(date) {
  if (!date) return 'Inconnue';
  return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Afficher les informations du serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'serverinfo')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/serverinfo`.',
        ephemeral: true
      });
    }

    const guild = interaction.guild;

    const owner = await guild.fetchOwner().catch(() => null);

    const totalMembers = guild.memberCount;
    const bots = guild.members.cache.filter(member => member.user.bot).size;
    const humans = totalMembers - bots;

    const textChannels = guild.channels.cache.filter(channel => channel.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2).size;
    const categories = guild.channels.cache.filter(channel => channel.type === 4).size;

    const roles = guild.roles.cache.filter(role => role.id !== guild.id).size;
    const emojis = guild.emojis.cache.size;
    const boosts = guild.premiumSubscriptionCount || 0;
    const boostLevel = guild.premiumTier || 0;

    const embed = new EmbedBuilder()
      .setTitle('🌐 Informations serveur')
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .setColor(0x5865f2)
      .addFields(
        {
          name: '📌 Général',
          value:
            `**Nom :** ${guild.name}\n` +
            `**ID :** \`${guild.id}\`\n` +
            `**Propriétaire :** ${owner ? owner.user.tag : 'Inconnu'}\n` +
            `**Créé le :** ${formatDate(guild.createdAt)}\n` +
            `**Depuis :** ${formatRelative(guild.createdAt)}`,
          inline: false
        },
        {
          name: '👥 Membres',
          value:
            `**Total :** ${totalMembers}\n` +
            `**Humains :** ${humans}\n` +
            `**Bots :** ${bots}`,
          inline: true
        },
        {
          name: '💬 Salons',
          value:
            `**Textuels :** ${textChannels}\n` +
            `**Vocaux :** ${voiceChannels}\n` +
            `**Catégories :** ${categories}`,
          inline: true
        },
        {
          name: '🎭 Serveur',
          value:
            `**Rôles :** ${roles}\n` +
            `**Emojis :** ${emojis}\n` +
            `**Boosts :** ${boosts}\n` +
            `**Niveau boost :** ${boostLevel}`,
          inline: true
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