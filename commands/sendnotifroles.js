const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const hasPermission = require('../utils/hasPermission');
const notifConfig = require('../config/notifRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendnotifroles')
    .setDescription('Envoie le panel des rôles notifications'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'sendnotifroles')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser cette commande.',
        ephemeral: true
      });
    }

    const channel = interaction.guild.channels.cache.find(
      c => c.name === notifConfig.channelName && c.isTextBased()
    );

    if (!channel) {
      return interaction.reply({
        content: `❌ Salon introuvable : ${notifConfig.channelName}`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📜 Rôles notifications')
      .setDescription(
        'Clique sur un bouton pour ajouter ou retirer un rôle notification.\n\n' +
        notifConfig.roles.map(r => `${r.emoji} **${r.label}**`).join('\n')
      )
      .setColor(0x5865f2)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      notifConfig.roles.map(role =>
        new ButtonBuilder()
          .setCustomId(`notif_role_${role.id}`)
          .setLabel(role.label)
          .setEmoji(role.emoji)
          .setStyle(ButtonStyle.Secondary)
      )
    );

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: `✅ Panel envoyé dans ${channel}.`,
      ephemeral: true
    });
  }
};