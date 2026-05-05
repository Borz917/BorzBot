const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const rolesConfig = require('../config/roles');

let ownerIds = [];

try {
  const ownerConfig = require('../config/owner');

  if (Array.isArray(ownerConfig)) {
    ownerIds = ownerConfig;
  } else if (Array.isArray(ownerConfig.ownerIds)) {
    ownerIds = ownerConfig.ownerIds;
  } else if (ownerConfig.ownerId) {
    ownerIds = [ownerConfig.ownerId];
  }
} catch (error) {
  console.warn('⚠️ config/owner.js introuvable ou invalide.');
}

const STAFF_HELP_ROLES = [
  'Main Team',
  'Gérant Staff',
  'Gérant Global',
  'Responsable Staff',
  'BORZ',
  'Onizuka'
];

const categories = {
  general: {
    label: 'Général',
    emoji: '📌',
    commands: [
      ['help', 'Afficher le menu d’aide'],
      ['userinfo', 'Afficher les infos utilisateur'],
      ['serverinfo', 'Afficher les infos serveur'],
      ['botinfo', 'Afficher les infos du bot'],
      ['invite', 'Obtenir le lien d’invitation'],
      ['support', 'Obtenir le serveur support']
    ]
  },

  moderation: {
    label: 'Modération',
    emoji: '🛡️',
    commands: [
      ['ban', 'Bannir un membre'],
      ['unban', 'Débannir un utilisateur'],
      ['kick', 'Expulser un membre'],
      ['warn', 'Avertir un membre'],
      ['unwarn', 'Retirer un warn'],
      ['warnlist', 'Voir les warns'],
      ['clearwarns', 'Supprimer les warns'],
      ['mute', 'Mute un membre'],
      ['unmute', 'Unmute un membre'],
      ['clear', 'Supprimer des messages'],
      ['lock', 'Verrouiller un salon'],
      ['unlock', 'Déverrouiller un salon'],
      ['slowmode', 'Modifier le slowmode']
    ]
  },

  roles: {
    label: 'Rôles',
    emoji: '🎭',
    commands: [
      ['addrole', 'Ajouter un rôle'],
      ['removerole', 'Retirer un rôle'],
      ['createrole', 'Créer un rôle'],
      ['deleterole', 'Supprimer un rôle'],
      ['sendnotifroles', 'Envoyer le panel notifications']
    ]
  },

  tickets: {
    label: 'Tickets',
    emoji: '🎫',
    commands: [
      ['sendticketpanel', 'Envoyer le panel ticket'],
      ['close', 'Fermer un ticket'],
      ['forceclose', 'Forcer la fermeture'],
      ['ticketinfo', 'Voir les infos ticket'],
      ['addticketmember', 'Ajouter un membre au ticket'],
      ['removeticketmember', 'Retirer un membre du ticket'],
      ['renameticket', 'Renommer un ticket']
    ]
  },

  invites: {
    label: 'Invitations / Giveaways',
    emoji: '📨',
    commands: [
      ['invitelogs', 'Voir les invitations'],
      ['sendinvitepanel', 'Envoyer le panel invitations'],
      ['creategiveaway', 'Créer un giveaway'],
      ['endgiveaway', 'Supprimer un giveaway'],
      ['resetinvites', 'Reset les invitations']
    ]
  },

  announcements: {
    label: 'Annonces',
    emoji: '📢',
    commands: [
      ['annonceserveur', 'Annonce serveur'],
      ['annonceillegal', 'Annonce illégal'],
      ['annoncelegal', 'Annonce légal'],
      ['annoncegiveaways', 'Annonce giveaways'],
      ['annonceevenement', 'Annonce événement']
    ]
  },

  security: {
    label: 'Sécurité',
    emoji: '🔐',
    commands: [
      ['securityview', 'Voir la config sécurité'],
      ['securityspam', 'Configurer anti-spam'],
      ['securitylink', 'Configurer anti-link'],
      ['securityignore', 'Gérer les rôles ignorés'],
      ['securityallowdomain', 'Gérer les domaines autorisés']
    ]
  },

  raid: {
    label: 'Anti-Raid',
    emoji: '🚨',
    commands: [
      ['raidview', 'Voir la config anti-raid'],
      ['raidconfig', 'Configurer anti-raid'],
      ['raidlock', 'Verrouiller le serveur'],
      ['raidunlock', 'Déverrouiller le serveur'],
      ['raidwhitelist', 'Gérer la whitelist anti-raid']
    ]
  },

  config: {
    label: 'Configuration',
    emoji: '⚙️',
    commands: [
      ['setupbot', 'Créer les salons logs'],
      ['diagnostic', 'Vérifier la configuration'],
      ['configview', 'Voir la configuration'],
      ['configstaffrole', 'Configurer le rôle staff'],
      ['configlogs', 'Configurer les salons logs'],
      ['confignotifrole', 'Configurer les rôles annonces'],
      ['configticketcategory', 'Configurer les catégories tickets'],
      ['configreset', 'Réinitialiser la config']
    ]
  },

  fun: {
    label: 'Mini-jeux',
    emoji: '🎮',
    commands: [
      ['coinflip', 'Pile ou face'],
      ['dice', 'Lancer un dé'],
      ['rps', 'Pierre-feuille-ciseaux'],
      ['duel', 'Défier un membre'],
      ['rank', 'Voir son rank duel'],
      ['leaderboard', 'Classement duel'],
      ['resetrank', 'Reset les ranks']
    ]
  },

  staff: {
    label: 'Staff Stats',
    emoji: '📊',
    commands: [
      ['staffstats', 'Voir les stats staff'],
      ['stafftop', 'Top staff actif'],
      ['resetstaffstats', 'Reset les stats staff']
    ]
  }
};

function isOwner(member) {
  if (!member) return false;

  const ids = Array.isArray(ownerIds) ? ownerIds : [];

  return ids.includes(member.id);
}

function isStaffForHelp(member) {
  if (!member) return false;

  if (isOwner(member)) return true;

  if (member.guild?.ownerId === member.id) return true;

  if (!member.roles?.cache) return false;

  return member.roles.cache.some(role => STAFF_HELP_ROLES.includes(role.name));
}

function canUseCommand(member, commandName) {
  if (isStaffForHelp(member)) return true;

  const allowedRoles = rolesConfig[commandName];

  if (!allowedRoles) return false;
  if (allowedRoles === 'ALL') return true;

  if (!Array.isArray(allowedRoles)) return false;

  return member.roles.cache.some(role => allowedRoles.includes(role.name));
}

function getPermissionText(commandName) {
  const allowedRoles = rolesConfig[commandName];

  if (!allowedRoles) return 'Non configuré';
  if (allowedRoles === 'ALL') return 'Tout le monde';
  if (Array.isArray(allowedRoles)) return allowedRoles.join(', ');

  return 'Non configuré';
}

function getCommandsForCategory(member, category, showAll) {
  if (showAll && isStaffForHelp(member)) {
    return category.commands;
  }

  return category.commands.filter(([commandName]) => {
    return canUseCommand(member, commandName);
  });
}

function splitText(text, maxLength = 950) {
  const lines = text.split('\n');
  const chunks = [];
  let current = '';

  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;

    if (next.length > maxLength) {
      if (current) chunks.push(current);
      current = line;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);

  return chunks;
}

function buildCommandText(commands, showPermissions) {
  if (!commands.length) return 'Aucune commande disponible.';

  return commands
    .map(([name, desc]) => {
      if (!showPermissions) {
        return `\`/${name}\` → ${desc}`;
      }

      return `\`/${name}\` → ${desc}\nPermission : **${getPermissionText(name)}**`;
    })
    .join(showPermissions ? '\n\n' : '\n');
}

function buildHelpEmbed(interaction, selectedCategoryKey = null, forceShowAll = false) {
  const member = interaction.member;
  const showAll = forceShowAll && isStaffForHelp(member);
  const showPermissions = showAll;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setFooter({ text: `Demandé par ${interaction.user.tag}` })
    .setTimestamp();

  if (selectedCategoryKey && categories[selectedCategoryKey]) {
    const category = categories[selectedCategoryKey];
    const commands = getCommandsForCategory(member, category, showAll);
    const text = buildCommandText(commands, showPermissions);
    const chunks = splitText(text, 950);

    embed
      .setTitle(`${category.emoji} Aide • ${category.label}`)
      .setDescription(
        showAll
          ? 'Mode bypass activé : toutes les commandes sont affichées.'
          : 'Voici les commandes disponibles pour toi.'
      );

    chunks.forEach((chunk, index) => {
      embed.addFields({
        name: index === 0 ? 'Commandes' : `Commandes suite ${index + 1}`,
        value: chunk,
        inline: false
      });
    });

    return embed;
  }

  embed
    .setTitle('📚 Aide BorzBot')
    .setDescription(
      showAll
        ? 'Mode bypass activé : toutes les commandes du bot sont visibles.'
        : 'Sélectionne une catégorie dans le menu ci-dessous.'
    );

  for (const [key, category] of Object.entries(categories)) {
    const commands = getCommandsForCategory(member, category, showAll);

    if (!commands.length) continue;

    embed.addFields({
      name: `${category.emoji} ${category.label}`,
      value: `${commands.length} commande(s)`,
      inline: true
    });
  }

  return embed;
}

function buildSelectMenu(member, showAll = false) {
  const realShowAll = showAll && isStaffForHelp(member);
  const options = [];

  for (const [key, category] of Object.entries(categories)) {
    const commands = getCommandsForCategory(member, category, realShowAll);

    if (!commands.length) continue;

    options.push({
      label: category.label,
      value: realShowAll ? `${key}:all` : key,
      description: `${commands.length} commande(s)`,
      emoji: category.emoji
    });
  }

  if (!options.length) {
    options.push({
      label: 'Aucune commande',
      value: 'none',
      description: 'Aucune commande disponible',
      emoji: '❌'
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('help_category_menu')
    .setPlaceholder('Choisis une catégorie')
    .addOptions(options.slice(0, 25));

  return new ActionRowBuilder().addComponents(menu);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Afficher la liste des commandes du bot')
    .addBooleanOption(option =>
      option
        .setName('all')
        .setDescription('Afficher toutes les commandes, bypass owner/staff')
        .setRequired(false)
    ),

  async execute(interaction) {
    const requestedAll = interaction.options.getBoolean('all') || false;
    const showAll = requestedAll && isStaffForHelp(interaction.member);

    if (requestedAll && !showAll) {
      return interaction.reply({
        content: '❌ Tu n’as pas accès au mode bypass du `/help`.',
        ephemeral: true
      });
    }

    const embed = buildHelpEmbed(interaction, null, showAll);
    const row = buildSelectMenu(interaction.member, showAll);

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  },

  buildHelpEmbed,
  buildSelectMenu
};