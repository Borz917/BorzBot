const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

const GuildConfig = require("../../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setupbot")
    .setDescription("Configurer BorzBot sur ce serveur.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    .addRoleOption(option =>
      option
        .setName("staff")
        .setDescription("Rôle staff qui pourra gérer les tickets.")
        .setRequired(false)
    )

    .addChannelOption(option =>
      option
        .setName("categorie_tickets")
        .setDescription("Catégorie où les tickets seront créés.")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(false)
    )

    .addChannelOption(option =>
      option
        .setName("logs")
        .setDescription("Salon de logs général du bot.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction) {
    const staffRole = interaction.options.getRole("staff");
    const ticketCategory = interaction.options.getChannel("categorie_tickets");
    const logChannel = interaction.options.getChannel("logs");

    let config = await GuildConfig.findOne({
      guildId: interaction.guild.id
    });

    if (!config) {
      config = await GuildConfig.create({
        guildId: interaction.guild.id,
        guildName: interaction.guild.name,
        ticketSubjects: []
      });
    }

    config.guildName = interaction.guild.name;

    if (staffRole) {
      config.staffRoleId = staffRole.id;
    }

    if (ticketCategory) {
      config.ticketCategoryId = ticketCategory.id;
    }

    if (logChannel) {
      config.logChannelId = logChannel.id;
    }

    if (!Array.isArray(config.ticketSubjects)) {
      config.ticketSubjects = [];
    }

    await config.save();

    const subjectsText = config.ticketSubjects.length
      ? config.ticketSubjects
          .map((subject, index) => {
            const log = subject.logChannelId
              ? `<#${subject.logChannelId}>`
              : "Aucun salon logs";

            return (
              `**${index + 1}. ${subject.emoji || "🎫"} ${subject.label || "Sans nom"}**\n` +
              `> ${subject.description || "Aucune description"}\n` +
              `> Logs : ${log}`
            );
          })
          .join("\n\n")
      : "Aucun sujet configuré.\nUtilise `/ticketsubjects add` pour ajouter des sujets.";

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("⚙️ Configuration BorzBot")
      .setDescription("La configuration du bot a été mise à jour.")
      .addFields(
        {
          name: "🛠️ Rôle staff",
          value: config.staffRoleId ? `<@&${config.staffRoleId}>` : "Non configuré",
          inline: true
        },
        {
          name: "🎫 Catégorie tickets",
          value: config.ticketCategoryId ? `<#${config.ticketCategoryId}>` : "Non configurée",
          inline: true
        },
        {
          name: "📋 Logs général",
          value: config.logChannelId ? `<#${config.logChannelId}>` : "Non configuré",
          inline: true
        },
        {
          name: "📌 Sujets tickets configurés",
          value: subjectsText.slice(0, 1024),
          inline: false
        }
      )
      .setFooter({
        text: `Serveur : ${interaction.guild.name}`
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};