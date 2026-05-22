const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const hasPermission = require('../../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendinvitepanel')
    .setDescription('Envoyer le panel des invitations'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'sendinvitepanel')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/sendinvitepanel`.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📨 Panel Invitations')
      .setDescription(
        `Utilise le menu ci-dessous pour consulter les invitations.\n\n` +
        `🏆 **Top 15** — Voir les meilleurs inviteurs\n` +
        `👤 **Mes invitations** — Voir ton nombre d’invitations\n` +
        `🎁 **Giveaways** — Voir les giveaways disponibles`
      )
      .setColor(0x5865f2)
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId('invite_panel_menu')
      .setPlaceholder('Choisis une catégorie')
      .addOptions(
        {
          label: 'Top 15 invitations',
          value: 'top15',
          description: 'Voir les 15 personnes avec le plus d’invitations',
          emoji: '🏆'
        },
        {
          label: 'Mes invitations',
          value: 'myinvites',
          description: 'Voir ton nombre d’invitations',
          emoji: '👤'
        },
        {
          label: 'Giveaways',
          value: 'giveaways',
          description: 'Voir les giveaways en cours',
          emoji: '🎁'
        }
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({
      content: '✅ Panel invitations envoyé.',
      ephemeral: true
    });
  }
};