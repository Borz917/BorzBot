const {
  SlashCommandBuilder,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder
} = require('discord.js');

const hasPermission = require('../utils/hasPermission');

const LOG_CATEGORY_NAME = 'Logs Discord';

const LOG_CHANNELS = [
  'moderation-logs',
  'voice-logs',
  'messages-logs',
  'boost-logs',
  'roles-logs',
  'raid-logs',
  'support-general-logs'
];

async function getOrCreateLogsCategory(guild, staffRole) {
  let category = guild.channels.cache.find(
    c => c.name === LOG_CATEGORY_NAME && c.type === ChannelType.GuildCategory
  );

  if (category) {
    return { channel: category, created: false };
  }

  const permissionOverwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionsBitField.Flags.ViewChannel]
    }
  ];

  if (staffRole) {
    permissionOverwrites.push({
      id: staffRole.id,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.ReadMessageHistory
      ]
    });
  }

  category = await guild.channels.create({
    name: LOG_CATEGORY_NAME,
    type: ChannelType.GuildCategory,
    permissionOverwrites
  });

  return { channel: category, created: true };
}

async function getOrCreateLogChannel(guild, channelName, category, staffRole) {
  let channel = guild.channels.cache.find(
    c => c.name === channelName && c.type === ChannelType.GuildText
  );

  if (channel) {
    return { channel, created: false };
  }

  const permissionOverwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionsBitField.Flags.ViewChannel]
    },
    {
      id: guild.members.me.id,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.ManageChannels
      ]
    }
  ];

  if (staffRole) {
    permissionOverwrites.push({
      id: staffRole.id,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.ReadMessageHistory
      ]
    });
  }

  channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites
  });

  return { channel, created: true };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupbot')
    .setDescription('Crée uniquement les salons de logs nécessaires au bot'),

  async execute(interaction) {
    try {
      if (!hasPermission(interaction.member, 'setupbot')) {
        return interaction.reply({
          content: '❌ Tu n’as pas la permission d’utiliser /setupbot.',
          ephemeral: true
        });
      }

      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;
      const botMember = guild.members.me;

      if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.editReply({
          content: '❌ Il me manque la permission **Gérer les salons**.'
        });
      }

      const staffRole =
        guild.roles.cache.find(r => r.name === 'Équipe STAFF') ||
        guild.roles.cache.find(r => r.name === 'staff') ||
        null;

      const categoryResult = await getOrCreateLogsCategory(guild, staffRole);

      const createdChannels = [];
      const existingChannels = [];

      for (const channelName of LOG_CHANNELS) {
        const result = await getOrCreateLogChannel(
          guild,
          channelName,
          categoryResult.channel,
          staffRole
        );

        if (result.created) {
          createdChannels.push(channelName);
        } else {
          existingChannels.push(channelName);
        }
      }

      const embed = new EmbedBuilder()
        .setTitle('✅ Setup logs terminé')
        .setColor(0x57f287)
        .setDescription(`Setup exécuté uniquement sur : **${guild.name}**`)
        .addFields(
          {
            name: '📁 Catégorie',
            value: categoryResult.created
              ? `Créée : **${LOG_CATEGORY_NAME}**`
              : `Déjà existante : **${LOG_CATEGORY_NAME}**`
          },
          {
            name: '✅ Salons créés',
            value: createdChannels.length > 0
              ? createdChannels.map(c => `#${c}`).join('\n')
              : 'Aucun'
          },
          {
            name: 'ℹ️ Salons déjà existants',
            value: existingChannels.length > 0
              ? existingChannels.map(c => `#${c}`).join('\n')
              : 'Aucun'
          }
        )
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed]
      });
    } catch (error) {
      console.error('❌ Erreur setupbot :', error);

      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({
          content: '❌ Une erreur est survenue pendant le setup logs.'
        }).catch(() => null);
      }

      return interaction.reply({
        content: '❌ Une erreur est survenue pendant le setup logs.',
        ephemeral: true
      }).catch(() => null);
    }
  }
};