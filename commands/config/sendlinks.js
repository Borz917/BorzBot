const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const GuildConfig = require("../../models/GuildConfig");

function formatLink(url, fallback) {
  if (!url) return fallback;
  return `[Clique ici](${url})`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sendlinks")
    .setDescription("Envoyer l'embed des liens importants.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    let config = await GuildConfig.findOne({
      guildId: interaction.guild.id
    });

    if (!config) {
      config = await GuildConfig.create({
        guildId: interaction.guild.id,
        guildName: interaction.guild.name
      });
    }

    const links = config.links || {};

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🔗 Liens utiles BorzBot")
      .setDescription(
        "Retrouve ici tous les liens importants liés à **BorzBot**."
      )
      .addFields(
        {
          name: "🌐 Site web",
          value: formatLink(links.site, "Bientôt disponible"),
          inline: false
        },
        {
          name: "📊 Dashboard",
          value: formatLink(links.dashboard, "Bientôt disponible"),
          inline: false
        },
        {
          name: "📘 Documentation",
          value: formatLink(links.documentation, "Bientôt disponible"),
          inline: false
        },
        {
          name: "🤖 Invitation du bot",
          value: formatLink(links.invite, "Bientôt disponible"),
          inline: false
        },
        {
          name: "💬 Serveur support",
          value: formatLink(links.support, "Ce serveur"),
          inline: false
        }
      )
      .setThumbnail(
        interaction.guild.iconURL({
          dynamic: true
        })
      )
      .setFooter({
        text: `Serveur : ${interaction.guild.name}`
      })
      .setTimestamp();

    await interaction.channel.send({
      embeds: [embed]
    });

    return interaction.reply({
      content: "✅ Embed des liens envoyé.",
      ephemeral: true
    });
  }
};