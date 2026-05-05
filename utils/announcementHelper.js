const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { getServerConfig } = require('./serverConfig');
const sendDiscordLog = require('./sendDiscordLog');

const announcementChannels = {
  serveur: [
    'annonces',
    'annonce',
    'annonces-serveur',
    'annonce-serveur',
    '📢・annonces',
    '📢・annonce'
  ],

  illegal: [
    'annonces-illegal',
    'annonce-illegal',
    'annonces-illégal',
    'annonce-illégal',
    'illegal-annonces',
    'illégal-annonces',
    '🔫・annonces',
    '🔫・annonces-illegal'
  ],

  legal: [
    'annonces-legal',
    'annonce-legal',
    'annonces-légal',
    'annonce-légal',
    'legal-annonces',
    'légal-annonces',
    '⚖️・annonces',
    '⚖️・annonces-legal'
  ],

  giveaways: [
    'giveaways',
    'giveaway',
    'annonces-giveaways',
    'annonce-giveaways',
    '🎁・giveaways',
    '🎁・annonces-giveaways'
  ],

  evenement: [
    'evenement',
    'événement',
    'evenements',
    'événements',
    'annonces-evenement',
    'annonces-événement',
    'event',
    'events',
    '🎉・événements',
    '🎉・evenements'
  ]
};

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-');
}

function findAnnouncementChannel(guild, type) {
  const names = announcementChannels[type] || [];
  const normalizedNames = names.map(normalizeName);

  return guild.channels.cache.find(channel => {
    if (
      channel.type !== ChannelType.GuildText &&
      channel.type !== ChannelType.GuildAnnouncement
    ) {
      return false;
    }

    const channelName = normalizeName(channel.name);
    return normalizedNames.includes(channelName);
  });
}

function getMention(interaction, type) {
  if (type === 'serveur') {
    return '@everyone';
  }

  const serverConfig = getServerConfig(interaction.guild.id);
  const roleId = serverConfig.notifRoles?.[type];

  if (!roleId) return '';

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) return '';

  return `<@&${role.id}>`;
}

function normalizeColor(colorInput, defaultColor) {
  if (!colorInput) return defaultColor;

  const cleaned = colorInput.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return parseInt(cleaned.replace('#', ''), 16);
  }

  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return parseInt(cleaned, 16);
  }

  return null;
}

async function sendAnnouncement(interaction, options) {
  const {
    type,
    title,
    message,
    image,
    color,
    manualChannel,
    defaultColor,
    logTitle
  } = options;

  const targetChannel = manualChannel || findAnnouncementChannel(interaction.guild, type);

  if (!targetChannel) {
    return interaction.reply({
      content:
        `❌ Aucun salon trouvé pour cette annonce.\n` +
        `Crée un salon adapté ou utilise l’option \`salon\` dans la commande.`,
      ephemeral: true
    });
  }

  const botPermissions = targetChannel.permissionsFor(interaction.guild.members.me);

  if (
    !botPermissions ||
    !botPermissions.has(PermissionsBitField.Flags.ViewChannel) ||
    !botPermissions.has(PermissionsBitField.Flags.SendMessages)
  ) {
    return interaction.reply({
      content: `❌ Je n’ai pas la permission d’envoyer un message dans ${targetChannel}.`,
      ephemeral: true
    });
  }

  const finalColor = normalizeColor(color, defaultColor);

  if (finalColor === null) {
    return interaction.reply({
      content: '❌ Couleur invalide. Utilise un format HEX comme `#5865F2`.',
      ephemeral: true
    });
  }

  const mention = getMention(interaction, type);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(message)
    .setColor(finalColor)
    .setFooter({
      text: `Annonce publiée par ${interaction.user.tag}`
    })
    .setTimestamp();

  if (image) {
    embed.setImage(image);
  }

  await targetChannel.send({
    content: mention || null,
    embeds: [embed],
    allowedMentions: {
      parse: type === 'serveur' ? ['everyone'] : [],
      roles: type !== 'serveur' && mention ? [mention.replace('<@&', '').replace('>', '')] : []
    }
  });

  await sendDiscordLog(
    interaction.guild,
    'moderation-logs',
    logTitle,
    `**Salon :** ${targetChannel}\n` +
    `**Auteur :** ${interaction.user.tag}\n` +
    `**Titre :** ${title}\n` +
    `**Mention :** ${mention || 'Aucune'}\n` +
    `**Message :** ${message.slice(0, 900)}`,
    finalColor
  );

  return interaction.reply({
    content: `✅ Annonce envoyée dans ${targetChannel}.`,
    ephemeral: true
  });
}

module.exports = {
  sendAnnouncement
};