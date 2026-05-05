const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

function formatDate(date) {
  if (!date) return 'Inconnue';

  return `<t:${Math.floor(date.getTime() / 1000)}:F>`;
}

function formatRelative(date) {
  if (!date) return 'Inconnue';

  return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Afficher les informations d’un utilisateur')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à vérifier, vide = toi')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'userinfo')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/userinfo`.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ Ce membre est introuvable sur ce serveur.',
        ephemeral: true
      });
    }

    const roles = member.roles.cache
      .filter(role => role.id !== interaction.guild.roles.everyone.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString());

    const displayedRoles =
      roles.length > 0
        ? roles.slice(0, 20).join(' ')
        : 'Aucun rôle';

    const rolesText =
      roles.length > 20
        ? `${displayedRoles}\n+${roles.length - 20} autre(s) rôle(s)`
        : displayedRoles;

    const embed = new EmbedBuilder()
      .setTitle(`👤 Informations utilisateur`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor(member.displayColor || 0x5865f2)
      .addFields(
        {
          name: 'Utilisateur',
          value:
            `**Tag :** ${user.tag}\n` +
            `**Mention :** ${user}\n` +
            `**ID :** \`${user.id}\`\n` +
            `**Bot :** ${user.bot ? 'Oui' : 'Non'}`,
          inline: false
        },
        {
          name: 'Compte Discord',
          value:
            `**Créé le :** ${formatDate(user.createdAt)}\n` +
            `**Depuis :** ${formatRelative(user.createdAt)}`,
          inline: false
        },
        {
          name: 'Serveur',
          value:
            `**A rejoint le :** ${formatDate(member.joinedAt)}\n` +
            `**Depuis :** ${formatRelative(member.joinedAt)}\n` +
            `**Surnom :** ${member.nickname || 'Aucun'}\n` +
            `**Rôle le plus haut :** ${member.roles.highest}`,
          inline: false
        },
        {
          name: `Rôles (${roles.length})`,
          value: rolesText.length > 1024
            ? rolesText.slice(0, 1000) + '\n...'
            : rolesText,
          inline: false
        }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};