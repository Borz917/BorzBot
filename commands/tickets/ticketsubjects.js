const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

const GuildConfig = require("../../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketsubjects")
    .setDescription("Gérer les sujets de tickets.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    .addSubcommand(subcommand =>
      subcommand
        .setName("add")
        .setDescription("Ajouter un sujet de ticket.")
        .addStringOption(option =>
          option
            .setName("label")
            .setDescription("Nom du sujet, exemple : Bug")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("emoji")
            .setDescription("Emoji du sujet, exemple : 🐞")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("description")
            .setDescription("Description du sujet.")
            .setRequired(true)
        )
        .addChannelOption(option =>
          option
            .setName("log")
            .setDescription("Salon de logs pour ce sujet.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName("remove")
        .setDescription("Supprimer un sujet de ticket.")
        .addIntegerOption(option =>
          option
            .setName("numero")
            .setDescription("Numéro du sujet à supprimer.")
            .setRequired(true)
        )
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName("list")
        .setDescription("Voir les sujets de tickets configurés.")
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName("clear")
        .setDescription("Supprimer tous les sujets de tickets.")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

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

    if (!Array.isArray(config.ticketSubjects)) {
      config.ticketSubjects = [];
    }

    if (subcommand === "add") {
      const label = interaction.options.getString("label");
      const emoji = interaction.options.getString("emoji");
      const description = interaction.options.getString("description");
      const logChannel = interaction.options.getChannel("log");

      if (config.ticketSubjects.length >= 25) {
        return interaction.reply({
          content: "❌ Tu ne peux pas avoir plus de 25 sujets de tickets.",
          ephemeral: true
        });
      }

      config.ticketSubjects.push({
        label,
        emoji,
        description,
        logChannelId: logChannel.id
      });

      await config.save();

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("✅ Sujet ajouté")
        .setDescription(
          `Le sujet de ticket a bien été ajouté.\n\n` +
          `**Sujet :** ${emoji} ${label}\n` +
          `**Description :** ${description}\n` +
          `**Logs :** ${logChannel}`
        )
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    if (subcommand === "list") {
      if (!config.ticketSubjects.length) {
        return interaction.reply({
          content: "❌ Aucun sujet de ticket configuré. Utilise `/ticketsubjects add` pour en ajouter.",
          ephemeral: true
        });
      }

      const list = config.ticketSubjects
        .map((subject, index) => {
          const logChannel = subject.logChannelId
            ? `<#${subject.logChannelId}>`
            : "Aucun salon";

          return (
            `**${index + 1}. ${subject.emoji || "🎫"} ${subject.label || "Sans nom"}**\n` +
            `> ${subject.description || "Aucune description"}\n` +
            `> Logs : ${logChannel}`
          );
        })
        .join("\n\n");

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("📋 Sujets de tickets configurés")
        .setDescription(list.slice(0, 4000))
        .setFooter({
          text: `Total : ${config.ticketSubjects.length} sujet(s)`
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    if (subcommand === "remove") {
      const numero = interaction.options.getInteger("numero");
      const index = numero - 1;

      if (!config.ticketSubjects[index]) {
        return interaction.reply({
          content: "❌ Sujet introuvable. Vérifie le numéro avec `/ticketsubjects list`.",
          ephemeral: true
        });
      }

      const removed = config.ticketSubjects[index];

      config.ticketSubjects.splice(index, 1);
      await config.save();

      return interaction.reply({
        content: `✅ Sujet supprimé : ${removed.emoji || "🎫"} **${removed.label}**`,
        ephemeral: true
      });
    }

    if (subcommand === "clear") {
      config.ticketSubjects = [];
      await config.save();

      return interaction.reply({
        content: "✅ Tous les sujets de tickets ont été supprimés.",
        ephemeral: true
      });
    }
  }
};