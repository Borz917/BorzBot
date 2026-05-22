const { SlashCommandBuilder, ChannelType } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const { sendAnnouncement } = require('../../utils/announcementHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annoncegiveaways')
    .setDescription('Envoyer une annonce giveaways')
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
        .setDescription('Couleur HEX, exemple : #FAA61A')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'annoncegiveaways')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/annoncegiveaways`.',
        ephemeral: true
      });
    }

    return sendAnnouncement(interaction, {
      type: 'giveaways',
      title: interaction.options.getString('titre') || '🎁 Annonce Giveaways',
      message: interaction.options.getString('message'),
      manualChannel: interaction.options.getChannel('salon'),
      image: interaction.options.getString('image'),
      color: interaction.options.getString('couleur'),
      defaultColor: 0xfaa61a,
      logTitle: '🎁 Annonce giveaways envoyée'
    });
  }
};