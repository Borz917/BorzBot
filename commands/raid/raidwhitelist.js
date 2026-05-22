const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');

const {
  getServerConfig,
  addRaidWhitelistRole,
  removeRaidWhitelistRole,
  addRaidIgnoredChannel,
  removeRaidIgnoredChannel
} = require('../../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidwhitelist')
    .setDescription('Gérer la whitelist anti-raid')
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Action à effectuer')
        .setRequired(true)
        .addChoices(
          { name: 'Ajouter un rôle whitelist', value: 'add_role' },
          { name: 'Retirer un rôle whitelist', value: 'remove_role' },
          { name: 'Ajouter un salon ignoré du raidlock', value: 'add_channel' },
          { name: 'Retirer un salon ignoré du raidlock', value: 'remove_channel' },
          { name: 'Voir la whitelist', value: 'list' }
        )
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Rôle à ajouter ou retirer')
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Salon à ignorer ou retirer des salons ignorés')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidwhitelist')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/raidwhitelist`.',
        ephemeral: true
      });
    }

    const action = interaction.options.getString('action');
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('salon');

    if ((action === 'add_role' || action === 'remove_role') && !role) {
      return interaction.reply({
        content: '❌ Tu dois préciser un rôle.',
        ephemeral: true
      });
    }

    if ((action === 'add_channel' || action === 'remove_channel') && !channel) {
      return interaction.reply({
        content: '❌ Tu dois préciser un salon.',
        ephemeral: true
      });
    }

    if (action === 'add_role') {
      addRaidWhitelistRole(interaction.guild.id, role.id);

      await sendDiscordLog(
        interaction.guild,
        'raid-logs',
        '🚨 Rôle whitelist anti-raid ajouté',
        `**Rôle :** ${role}\n**Modérateur :** ${interaction.user.tag}`,
        0x57f287
      );

      return interaction.reply({
        content: `✅ Le rôle ${role} est maintenant whitelist anti-raid.`,
        ephemeral: true
      });
    }

    if (action === 'remove_role') {
      removeRaidWhitelistRole(interaction.guild.id, role.id);

      await sendDiscordLog(
        interaction.guild,
        'raid-logs',
        '🚨 Rôle whitelist anti-raid retiré',
        `**Rôle :** ${role}\n**Modérateur :** ${interaction.user.tag}`,
        0xed4245
      );

      return interaction.reply({
        content: `✅ Le rôle ${role} n’est plus whitelist anti-raid.`,
        ephemeral: true
      });
    }

    if (action === 'add_channel') {
      addRaidIgnoredChannel(interaction.guild.id, channel.id);

      await sendDiscordLog(
        interaction.guild,
        'raid-logs',
        '🚨 Salon ignoré raidlock ajouté',
        `**Salon :** ${channel}\n**Modérateur :** ${interaction.user.tag}`,
        0x57f287
      );

      return interaction.reply({
        content: `✅ Le salon ${channel} sera ignoré pendant le raidlock.`,
        ephemeral: true
      });
    }

    if (action === 'remove_channel') {
      removeRaidIgnoredChannel(interaction.guild.id, channel.id);

      await sendDiscordLog(
        interaction.guild,
        'raid-logs',
        '🚨 Salon ignoré raidlock retiré',
        `**Salon :** ${channel}\n**Modérateur :** ${interaction.user.tag}`,
        0xed4245
      );

      return interaction.reply({
        content: `✅ Le salon ${channel} ne sera plus ignoré pendant le raidlock.`,
        ephemeral: true
      });
    }

    const config = getServerConfig(interaction.guild.id);
    const raid = config.raid || {};

    const roles =
      raid.whitelistRoleIds?.length > 0
        ? raid.whitelistRoleIds.map(id => `• <@&${id}>`).join('\n')
        : 'Aucun rôle whitelist.';

    const channels =
      raid.lockIgnoredChannelIds?.length > 0
        ? raid.lockIgnoredChannelIds.map(id => `• <#${id}>`).join('\n')
        : 'Aucun salon ignoré.';

    const embed = new EmbedBuilder()
      .setTitle('🚨 Whitelist Anti-Raid')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '🎭 Rôles whitelist',
          value: roles,
          inline: false
        },
        {
          name: '💬 Salons ignorés raidlock',
          value: channels,
          inline: false
        }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};