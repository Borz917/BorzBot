const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');

const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendinvitepanel')
    .setDescription('Envoie le panel InviteLogs'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'sendinvitepanel')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📨 Panel Invitations')
      .setDescription(
        'Utilise le menu ci-dessous pour consulter les invitations.\n\n' +
        '🏆 **Top 15** → Voir les meilleurs inviteurs\n' +
        '📨 **Mes invitations** → Voir ton nombre d’invitations\n' +
        '🎁 **Giveaways** → Voir les giveaways actuellement disponibles'
      )
      .setColor(0x5865f2)
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId('invite_panel_menu')
      .setPlaceholder('Choisis une option')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Top 15 invitations')
          .setDescription('Voir les 15 meilleurs inviteurs')
          .setValue('top15')
          .setEmoji('🏆'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Mes invitations')
          .setDescription('Voir ton nombre d’invitations')
          .setValue('myinvites')
          .setEmoji('📨'),

        new StringSelectMenuOptionBuilder()
          .setLabel('Giveaways en cours')
          .setDescription('Voir les giveaways disponibles')
          .setValue('giveaways')
          .setEmoji('🎁')
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: '✅ Panel InviteLogs envoyé.',
      ephemeral: true
    });
  }
};