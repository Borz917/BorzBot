const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');
const { setLogChannel } = require('../utils/serverConfig');

const logChannels = [
  { type: 'moderation', name: 'moderation-logs' },
  { type: 'voice', name: 'voice-logs' },
  { type: 'messages', name: 'messages-logs' },
  { type: 'boost', name: 'boost-logs' },
  { type: 'roles', name: 'roles-logs' },
  { type: 'raid', name: 'raid-logs' },
  { type: 'support', name: 'support-general-logs' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupbot')
    .setDescription('Créer automatiquement les salons logs nécessaires au bot'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'setupbot')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/setupbot`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les salons`.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    let category = interaction.guild.channels.cache.find(
      channel => channel.name === '📋・BorzBot Logs' && channel.type === ChannelType.GuildCategory
    );

    if (!category) {
      category = await interaction.guild.channels.create({
        name: '📋・BorzBot Logs',
        type: ChannelType.GuildCategory,
        reason: `Setup BorzBot par ${interaction.user.tag}`
      });
    }

    const created = [];
    const existing = [];

    for (const log of logChannels) {
      let channel = interaction.guild.channels.cache.find(
        c => c.name === log.name && c.type === ChannelType.GuildText
      );

      if (!channel) {
        channel = await interaction.guild.channels.create({
          name: log.name,
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
              id: interaction.guild.members.me.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.EmbedLinks,
                PermissionsBitField.Flags.AttachFiles
              ]
            }
          ],
          reason: `Setup BorzBot par ${interaction.user.tag}`
        });

        created.push(channel);
      } else {
        existing.push(channel);
      }

      setLogChannel(interaction.guild.id, log.type, channel.id);
    }

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '⚙️ Setup BorzBot effectué',
      `**Par :** ${interaction.user.tag}\n` +
      `**Salons créés :** ${created.length}\n` +
      `**Salons déjà existants :** ${existing.length}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Setup BorzBot terminé')
      .setDescription(
        `✅ Configuration des salons logs terminée.\n\n` +
        `**Salons créés :** ${created.length}\n` +
        `**Salons déjà existants :** ${existing.length}\n\n` +
        created.map(c => `✅ ${c}`).join('\n')
      )
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.editReply({
      embeds: [embed]
    });
  }
};