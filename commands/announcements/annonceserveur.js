const { SlashCommandBuilder, ChannelType } = require('discord.js');
const hasPermission = require("../../utils/hasPermission")
const { sendAnnouncement } = require('../../utils/announcementHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annonceserveur')
    .setDescription('Envoyer une annonce serveur avec @everyone')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message de l’annonce')
        .setRequired(true)
        .setMaxLength(4000)
    )
    .addStringOption(option =>
      option
        .setName('titre')
        .setDescription('Titre de l’annonce')
        .setRequired(false)
        .setMaxLength(150)
    )
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Salon où envoyer l’annonce')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('image')
        .setDescription('URL d’une image optionnelle')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('couleur')
        .setDescription('Couleur HEX, exemple : #5865F2')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'annonceserveur')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/annonceserveur`.',
        ephemeral: true
      });
    }

    return sendAnnouncement(interaction, {
      type: 'serveur',
      title: interaction.options.getString('titre') || '📢 Annonce Serveur',
      message: interaction.options.getString('message'),
      manualChannel: interaction.options.getChannel('salon'),
      image: interaction.options.getString('image'),
      color: interaction.options.getString('couleur'),
      defaultColor: 0x5865f2,
      logTitle: '📢 Annonce serveur envoyée'
    });
  }
};