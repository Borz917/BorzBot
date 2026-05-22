const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const GuildConfig = require("../../models/GuildConfig");

function isValidUrl(url) {
  if (!url) return true;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlinks")
    .setDescription("Configurer les liens importants du serveur.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    .addStringOption(option =>
      option
        .setName("site")
        .setDescription("Lien du site web.")
        .setRequired(false)
    )

    .addStringOption(option =>
      option
        .setName("dashboard")
        .setDescription("Lien du dashboard.")
        .setRequired(false)
    )

    .addStringOption(option =>
      option
        .setName("documentation")
        .setDescription("Lien de la documentation.")
        .setRequired(false)
    )

    .addStringOption(option =>
      option
        .setName("invite")
        .setDescription("Lien d'invitation du bot.")
        .setRequired(false)
    )

    .addStringOption(option =>
      option
        .setName("support")
        .setDescription("Lien du serveur support.")
        .setRequired(false)
    ),

  async execute(interaction) {
    const site = interaction.options.getString("site");
    const dashboard = interaction.options.getString("dashboard");
    const documentation = interaction.options.getString("documentation");
    const invite = interaction.options.getString("invite");
    const support = interaction.options.getString("support");

    const linksToCheck = {
      site,
      dashboard,
      documentation,
      invite,
      support
    };

    const hasAtLeastOneLink = Object.values(linksToCheck).some(Boolean);

    if (!hasAtLeastOneLink) {
      return interaction.reply({
        content: "❌ Tu dois mettre au moins un lien à configurer.",
        ephemeral: true
      });
    }

    for (const [name, url] of Object.entries(linksToCheck)) {
      if (url && !isValidUrl(url)) {
        return interaction.reply({
          content: `❌ Le lien \`${name}\` est invalide. Il doit commencer par \`http://\` ou \`https://\`.`,
          ephemeral: true
        });
      }
    }

    let config = await GuildConfig.findOne({
      guildId: interaction.guild.id
    });

    if (!config) {
      config = await GuildConfig.create({
        guildId: interaction.guild.id,
        guildName: interaction.guild.name
      });
    }

    if (!config.links) {
      config.links = {};
    }

    if (site) config.links.site = site;
    if (dashboard) config.links.dashboard = dashboard;
    if (documentation) config.links.documentation = documentation;
    if (invite) config.links.invite = invite;
    if (support) config.links.support = support;

    await config.save();

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Liens mis à jour")
      .setDescription("Les liens importants du serveur ont été configurés.")
      .addFields(
        {
          name: "🌐 Site web",
          value: config.links.site || "Bientôt disponible",
          inline: false
        },
        {
          name: "📊 Dashboard",
          value: config.links.dashboard || "Bientôt disponible",
          inline: false
        },
        {
          name: "📘 Documentation",
          value: config.links.documentation || "Bientôt disponible",
          inline: false
        },
        {
          name: "🤖 Invitation du bot",
          value: config.links.invite || "Bientôt disponible",
          inline: false
        },
        {
          name: "💬 Serveur support",
          value: config.links.support || "Ce serveur",
          inline: false
        }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};