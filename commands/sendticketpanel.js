const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const hasPermission = require('../utils/hasPermission');
const ticketConfig = require('../config/ticketConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendticketpanel')
    .setDescription('Envoyer le panel de création de ticket'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'sendticketpanel')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/sendticketpanel`.',
        ephemeral: true
      });
    }

    const subjects = ticketConfig.ticketSubjects || [];

    if (!subjects.length) {
      return interaction.reply({
        content: '❌ Aucun sujet de ticket n’est configuré dans `ticketConfig.js`.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎫 Support • Tickets')
      .setDescription(
        `Bienvenue dans le support.\n\n` +
        `Sélectionne une catégorie ci-dessous pour ouvrir un ticket.\n\n` +
        `Merci d’expliquer clairement ta demande une fois le ticket créé.`
      )
      .setColor(0x5865f2)
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_create_menu')
      .setPlaceholder('Choisis le sujet de ton ticket')
      .addOptions(
        subjects.map(subject => ({
          label: subject.label,
          value: subject.id,
          description: subject.description || 'Ouvrir un ticket',
          emoji: subject.emoji || '🎫'
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({
      content: '✅ Panel ticket envoyé.',
      ephemeral: true
    });
  }
};