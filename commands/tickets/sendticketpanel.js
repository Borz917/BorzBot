const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require("discord.js");

const GuildConfig = require("../../models/GuildConfig");
const reply = require("../../utils/reply");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sendticketpanel")
    .setDescription("Envoyer le panel ticket.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const config = await GuildConfig.findOne({
      guildId: interaction.guild.id
    });

    if (!config) {
      return reply.error(
        interaction,
        "Configuration introuvable",
        "Aucune configuration n'a été trouvée pour ce serveur. Utilise d'abord `/setupbot`.",
        { ephemeral: true }
      );
    }

    const subjects = config.ticketSubjects || [];

    if (!subjects.length) {
      return reply.error(
        interaction,
        "Aucun sujet configuré",
        "Aucun sujet de ticket n'est configuré. Utilise d'abord `/ticketsubjects add`.",
        { ephemeral: true }
      );
    }

    const options = subjects.slice(0, 25).map((subject, index) => {
      // Compatibilité si tu as encore d'anciens sujets en string dans la DB
      if (typeof subject === "string") {
        return {
          label: subject.replace(/^[^\wÀ-ÿ]+/u, "").trim().slice(0, 100) || "Support",
          description: `Créer un ticket : ${subject}`.slice(0, 100),
          value: `ticket_${index}`
        };
      }

      return {
        label: String(subject.label || "Support").slice(0, 100),
        description: String(subject.description || `Créer un ticket : ${subject.label}`).slice(0, 100),
        value: `ticket_${index}`,
        emoji: subject.emoji || undefined
      };
    });

    const subjectsList = subjects
      .map((subject, index) => {
        if (typeof subject === "string") {
          return `${index + 1}. ${subject}`;
        }

        const emoji = subject.emoji || "🎫";
        const label = subject.label || "Support";
        const description = subject.description || "Aucune description";

        return `${index + 1}. ${emoji} **${label}**\n> ${description}`;
      })
      .join("\n\n");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_subject")
      .setPlaceholder("🎫 Choisis un sujet")
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🎫 Support BorzBot")
      .setDescription(
        "Choisis le sujet correspondant à ta demande dans le menu ci-dessous."
      )
      .addFields({
        name: "📌 Sujets disponibles",
        value: subjectsList.slice(0, 1024)
      })
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
      embeds: [embed],
      components: [row]
    });

    return reply.success(
      interaction,
      "Panel ticket envoyé",
      "Le panel ticket a été envoyé avec les sujets configurés.",
      {
        ephemeral: true
      }
    );
  }
};