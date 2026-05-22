const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche la liste des commandes du bot"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("📘 Menu d’aide — BorzBot")
      .setDescription(
        "Bienvenue dans le menu d’aide de **BorzBot**.\n\n" +
        "Sélectionne une catégorie ci-dessous pour voir les commandes disponibles."
      )
      .addFields(
        {
          name: "🛡️ Modération",
          value: "`/ban`, `/unban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/unwarn`, `/warnlist`"
        },
        {
          name: "🎭 Gestion des rôles",
          value: "`/addrole`, `/removerole`, `/createrole`, `/deleterole`"
        },
        {
          name: "🎫 Tickets",
          value: "`/setupbot`, `/sendticketpanel`, `/ticketsubjects`, `/forceclose`"
        },
        {
          name: "⚙️ Configuration",
          value: "`/setlogs`, `/setstaffrole`, `/setcategory`, `/config`"
        },
        {
          name: "🧱 Sécurité",
          value: "`/antilink`, `/antispam`, `/antiinsulte`"
        },
        {
          name: "📜 Logs",
          value: "`/modlogs`, `/logssanction`, `/infowarn`"
        }
      )
      .setFooter({
        text: "BorzBot • Système de modération Discord"
      })
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId("help_menu")
      .setPlaceholder("Choisis une catégorie")
      .addOptions(
        {
          label: "Modération",
          description: "Commandes de sanction et modération",
          value: "moderation",
          emoji: "🛡️"
        },
        {
          label: "Gestion des rôles",
          description: "Commandes pour gérer les rôles",
          value: "roles",
          emoji: "🎭"
        },
        {
          label: "Tickets",
          description: "Commandes liées au système de tickets",
          value: "tickets",
          emoji: "🎫"
        },
        {
          label: "Configuration",
          description: "Configurer BorzBot sur le serveur",
          value: "config",
          emoji: "⚙️"
        },
        {
          label: "Sécurité",
          description: "Anti-link, anti-spam et anti-insulte",
          value: "security",
          emoji: "🧱"
        },
        {
          label: "Logs",
          description: "Voir les logs et historiques",
          value: "logs",
          emoji: "📜"
        }
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};
