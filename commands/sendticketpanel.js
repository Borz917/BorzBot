const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');
const ticketConfig = require('../config/ticketConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendticketpanel')
    .setDescription('Envoie le panel de création de ticket'),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎫 Ouvrir un ticket')
      .setDescription(
        'Choisis le sujet de ton ticket dans le menu ci-dessous.\n\n' +
        'Merci de ne pas ouvrir plusieurs tickets pour la même demande.'
      )
      .setColor(0x5865f2);

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket_create_menu')
        .setPlaceholder('Choisis le sujet de ton ticket')
        .addOptions(
          ticketConfig.ticketSubjects.map(subject => ({
            label: subject.label.slice(0, 100),
            value: subject.id
          }))
        )
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: '✅ Panel ticket envoyé.',
      ephemeral: true
    });
  }
};