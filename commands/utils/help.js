const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits
} = require("discord.js");

const categories = {
  general: {
    label: "Général",
    emoji: "📌",
    description: "Commandes générales du bot.",
    commands: [
      {
        name: "/help",
        description: "Afficher le menu d’aide de BorzBot."
      },
      {
        name: "/ping",
        description: "Voir la latence du bot."
      }
    ]
  },

  moderation: {
    label: "Modération",
    emoji: "🛡️",
    description: "Commandes pour gérer les sanctions et la modération.",
    commands: [
      {
        name: "/ban",
        description: "Bannir un membre du serveur."
      },
      {
        name: "/unban",
        description: "Débannir un utilisateur."
      },
      {
        name: "/kick",
        description: "Expulser un membre du serveur."
      },
      {
        name: "/warn",
        description: "Ajouter un avertissement à un membre."
      },
      {
        name: "/unwarn",
        description: "Retirer un avertissement à un membre."
      },
      {
        name: "/warnlist",
        description: "Voir les avertissements d’un membre."
      },
      {
        name: "/mute",
        description: "Mute temporairement un membre."
      },
      {
        name: "/unmute",
        description: "Retirer le mute d’un membre."
      },
      {
        name: "/modlogs",
        description: "Voir les logs de modération."
      }
    ]
  },

  tickets: {
    label: "Tickets",
    emoji: "🎫",
    description: "Commandes pour configurer et gérer les tickets.",
    commands: [
      {
        name: "/setupbot",
        description: "Configurer le rôle staff, la catégorie tickets et les logs généraux."
      },
      {
        name: "/ticketsubjects add",
        description: "Ajouter un sujet de ticket avec emoji, description et salon de logs."
      },
      {
        name: "/ticketsubjects list",
        description: "Voir les sujets de tickets configurés."
      },
      {
        name: "/ticketsubjects remove",
        description: "Supprimer un sujet de ticket."
      },
      {
        name: "/ticketsubjects clear",
        description: "Supprimer tous les sujets de tickets."
      },
      {
        name: "/sendticketpanel",
        description: "Envoyer le panel ticket avec les sujets configurés."
      },
      {
        name: "/forceclose",
        description: "Fermer un ticket manuellement si besoin."
      }
    ]
  },

  configuration: {
    label: "Configuration",
    emoji: "⚙️",
    description: "Commandes pour configurer BorzBot sur le serveur.",
    commands: [
      {
        name: "/setupbot",
        description: "Configurer les bases du bot."
      },
      {
        name: "/setlinks",
        description: "Configurer les liens du site, dashboard, documentation, invitation et support."
      },
      {
        name: "/sendlinks",
        description: "Envoyer l’embed des liens utiles."
      },
      {
        name: "/config",
        description: "Voir ou modifier la configuration du bot."
      },
      {
        name: "/setlogs",
        description: "Définir le salon de logs."
      },
      {
        name: "/setstaffrole",
        description: "Définir le rôle staff."
      },
      {
        name: "/setticketcategory",
        description: "Définir la catégorie des tickets."
      }
    ]
  },

  protections: {
    label: "Protections",
    emoji: "🚫",
    description: "Commandes liées à la sécurité du serveur.",
    commands: [
      {
        name: "/antilink",
        description: "Activer ou désactiver l’anti-link."
      },
      {
        name: "/antispam",
        description: "Activer ou désactiver l’anti-spam."
      },
      {
        name: "/antiinsulte",
        description: "Activer ou désactiver l’anti-insulte."
      }
    ]
  },

  roles: {
    label: "Rôles",
    emoji: "👥",
    description: "Commandes pour gérer les rôles.",
    commands: [
      {
        name: "/addrole",
        description: "Ajouter un rôle à un membre."
      },
      {
        name: "/removerole",
        description: "Retirer un rôle à un membre."
      },
      {
        name: "/createrole",
        description: "Créer un rôle."
      },
      {
        name: "/deleterole",
        description: "Supprimer un rôle."
      }
    ]
  },

  liens: {
    label: "Liens",
    emoji: "🔗",
    description: "Commandes liées aux liens importants de BorzBot.",
    commands: [
      {
        name: "/setlinks",
        description: "Configurer les liens importants."
      },
      {
        name: "/sendlinks",
        description: "Envoyer l’embed des liens utiles."
      }
    ]
  }
};

function buildHelpEmbed(interaction, selectedCategory = "general", showAll = false) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("📚 Aide BorzBot")
    .setThumbnail(
      interaction.client.user.displayAvatarURL({
        dynamic: true
      })
    )
    .setFooter({
      text: `Demandé par ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp();

  if (showAll) {
    embed.setDescription(
      "Voici toutes les catégories et commandes disponibles sur **BorzBot**."
    );

    for (const category of Object.values(categories)) {
      const commandsText = category.commands
        .map(command => `\`${command.name}\` — ${command.description}`)
        .join("\n");

      embed.addFields({
        name: `${category.emoji} ${category.label}`,
        value: commandsText.slice(0, 1024) || "Aucune commande.",
        inline: false
      });
    }

    return embed;
  }

  const category = categories[selectedCategory] || categories.general;

  embed.setDescription(
    `${category.emoji} **${category.label}**\n${category.description}`
  );

  const commandsText = category.commands
    .map(command => `\`${command.name}\`\n> ${command.description}`)
    .join("\n\n");

  embed.addFields({
    name: "Commandes disponibles",
    value: commandsText.slice(0, 4000) || "Aucune commande dans cette catégorie.",
    inline: false
  });

  embed.addFields({
    name: "Astuce",
    value: "Utilise le menu ci-dessous pour changer de catégorie.",
    inline: false
  });

  return embed;
}

function buildSelectMenu(member, showAll = false) {
  const options = Object.entries(categories).map(([key, category]) => ({
    label: category.label,
    description: category.description.slice(0, 100),
    value: key,
    emoji: category.emoji
  }));

  options.push({
    label: showAll ? "Vue simple" : "Voir toutes les commandes",
    description: showAll
      ? "Revenir à une catégorie simple."
      : "Afficher toutes les commandes du bot.",
    value: showAll ? "general" : "general:all",
    emoji: "📚"
  });

  const menu = new StringSelectMenuBuilder()
    .setCustomId("help_category_menu")
    .setPlaceholder("📚 Choisis une catégorie")
    .addOptions(options.slice(0, 25));

  return new ActionRowBuilder().addComponents(menu);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Afficher le menu d’aide de BorzBot."),

  categories,
  buildHelpEmbed,
  buildSelectMenu,

  async execute(interaction) {
    const embed = buildHelpEmbed(interaction, "general", false);
    const row = buildSelectMenu(interaction.member, false);

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};
