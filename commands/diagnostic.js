const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

const requiredLogChannels = [
  'moderation-logs',
  'voice-logs',
  'messages-logs',
  'boost-logs',
  'roles-logs',
  'raid-logs',
  'support-general-logs'
];

const requiredRoles = [
  'Équipe STAFF',
  'Notification Illégal',
  'Notification Événement',
  'Notification Giveaways',
  'Notification Légal'
];

const requiredPermissions = [
  {
    name: 'Gérer les salons',
    flag: PermissionsBitField.Flags.ManageChannels
  },
  {
    name: 'Gérer les rôles',
    flag: PermissionsBitField.Flags.ManageRoles
  },
  {
    name: 'Gérer les messages',
    flag: PermissionsBitField.Flags.ManageMessages
  },
  {
    name: 'Expulser des membres',
    flag: PermissionsBitField.Flags.KickMembers
  },
  {
    name: 'Bannir des membres',
    flag: PermissionsBitField.Flags.BanMembers
  },
  {
    name: 'Modérer les membres',
    flag: PermissionsBitField.Flags.ModerateMembers
  },
  {
    name: 'Voir les salons',
    flag: PermissionsBitField.Flags.ViewChannel
  },
  {
    name: 'Envoyer des messages',
    flag: PermissionsBitField.Flags.SendMessages
  },
  {
    name: 'Lire l’historique',
    flag: PermissionsBitField.Flags.ReadMessageHistory
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('diagnostic')
    .setDescription('Vérifie la configuration du bot sur ce serveur'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'diagnostic')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    await interaction.deferReply({
      ephemeral: true
    });

    const guild = interaction.guild;
    const botMember = guild.members.me;

    const missingChannels = requiredLogChannels.filter(channelName => {
      return !guild.channels.cache.some(
        channel => channel.name === channelName && channel.isTextBased()
      );
    });

    const existingChannels = requiredLogChannels.filter(channelName => {
      return guild.channels.cache.some(
        channel => channel.name === channelName && channel.isTextBased()
      );
    });

    const missingRoles = requiredRoles.filter(roleName => {
      return !guild.roles.cache.some(role => role.name === roleName);
    });

    const existingRoles = requiredRoles.filter(roleName => {
      return guild.roles.cache.some(role => role.name === roleName);
    });

    const missingPermissions = requiredPermissions.filter(permission => {
      return !botMember.permissions.has(permission.flag);
    });

    const existingPermissions = requiredPermissions.filter(permission => {
      return botMember.permissions.has(permission.flag);
    });

    const status =
      missingChannels.length === 0 &&
      missingRoles.length === 0 &&
      missingPermissions.length === 0
        ? '✅ Configuration complète'
        : '⚠️ Configuration incomplète';

    const embed = new EmbedBuilder()
      .setTitle('🧪 Diagnostic BorzBot')
      .setDescription(`Serveur : **${guild.name}**\nStatut : **${status}**`)
      .setColor(status.startsWith('✅') ? 0x57f287 : 0xfaa61a)
      .addFields(
        {
          name: '✅ Salons logs trouvés',
          value: existingChannels.length > 0
            ? existingChannels.map(c => `#${c}`).join('\n')
            : 'Aucun',
          inline: true
        },
        {
          name: '❌ Salons logs manquants',
          value: missingChannels.length > 0
            ? missingChannels.map(c => `#${c}`).join('\n')
            : 'Aucun',
          inline: true
        },
        {
          name: '✅ Rôles trouvés',
          value: existingRoles.length > 0
            ? existingRoles.join('\n')
            : 'Aucun',
          inline: true
        },
        {
          name: '❌ Rôles manquants',
          value: missingRoles.length > 0
            ? missingRoles.join('\n')
            : 'Aucun',
          inline: true
        },
        {
          name: '✅ Permissions OK',
          value: existingPermissions.length > 0
            ? existingPermissions.map(p => p.name).join('\n')
            : 'Aucune',
          inline: true
        },
        {
          name: '❌ Permissions manquantes',
          value: missingPermissions.length > 0
            ? missingPermissions.map(p => p.name).join('\n')
            : 'Aucune',
          inline: true
        }
      )
      .setFooter({
        text: 'Utilise /setupbot pour créer les salons logs manquants.'
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed]
    });
  }
};