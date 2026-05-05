const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require('discord.js');

const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');
const notifConfig = require('../config/notifRoles');

function chunkArray(array, size) {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendnotifroles')
    .setDescription('Envoyer le panel des rôles notifications'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'sendnotifroles')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/sendnotifroles`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les rôles`.',
        ephemeral: true
      });
    }

    const roles = notifConfig.roles || [];

    if (!roles.length) {
      return interaction.reply({
        content: '❌ Aucun rôle notification configuré dans `config/notifRoles.js`.',
        ephemeral: true
      });
    }

    const missingRoles = [];
    const uneditableRoles = [];

    for (const roleData of roles) {
      const role = interaction.guild.roles.cache.find(r => r.name === roleData.roleName);

      if (!role) {
        missingRoles.push(roleData.roleName);
        continue;
      }

      if (!role.editable) {
        uneditableRoles.push(role.name);
      }
    }

    if (missingRoles.length > 0) {
      return interaction.reply({
        content:
          `❌ Certains rôles n’existent pas sur le serveur :\n` +
          missingRoles.map(name => `• \`${name}\``).join('\n') +
          `\n\nCrée-les ou modifie \`config/notifRoles.js\`.`,
        ephemeral: true
      });
    }

    if (uneditableRoles.length > 0) {
      return interaction.reply({
        content:
          `❌ Je ne peux pas gérer certains rôles :\n` +
          uneditableRoles.map(name => `• \`${name}\``).join('\n') +
          `\n\nMets le rôle du bot au-dessus de ces rôles.`,
        ephemeral: true
      });
    }

    const description = roles
      .map(role =>
        `${role.emoji || '🔔'} **${role.label}**\n${role.description || 'Recevoir cette notification.'}`
      )
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('🔔 Rôles notifications')
      .setDescription(
        `Clique sur les boutons ci-dessous pour ajouter ou retirer tes rôles notifications.\n\n` +
        `${description}`
      )
      .setColor(0x5865f2)
      .setFooter({ text: 'Clique une fois pour ajouter, clique encore pour retirer.' })
      .setTimestamp();

    const rows = chunkArray(roles, 5).map(chunk => {
      const row = new ActionRowBuilder();

      for (const role of chunk) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`notif_role_${role.id}`)
            .setLabel(role.label)
            .setEmoji(role.emoji || '🔔')
            .setStyle(ButtonStyle.Secondary)
        );
      }

      return row;
    });

    await interaction.channel.send({
      embeds: [embed],
      components: rows
    });

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🔔 Panel rôles notifications envoyé',
      `**Salon :** ${interaction.channel}\n` +
      `**Staff :** ${interaction.user.tag}\n` +
      `**Rôles :** ${roles.map(r => r.roleName).join(', ')}`,
      0x5865f2
    );

    return interaction.reply({
      content: '✅ Panel rôles notifications envoyé.',
      ephemeral: true
    });
  }
};