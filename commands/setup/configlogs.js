const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');
const { setLogChannel } = require('../../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configlogs')
    .setDescription('Configurer les salons logs')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type de logs')
        .setRequired(true)
        .addChoices(
          { name: 'Modération', value: 'moderation' },
          { name: 'Vocal', value: 'voice' },
          { name: 'Messages', value: 'messages' },
          { name: 'Boost', value: 'boost' },
          { name: 'Rôles', value: 'roles' },
          { name: 'Raid', value: 'raid' },
          { name: 'Support', value: 'support' }
        )
    )
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Salon de logs')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configlogs')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/configlogs`.',
        ephemeral: true
      });
    }

    const type = interaction.options.getString('type');
    const channel = interaction.options.getChannel('salon');

    setLogChannel(interaction.guild.id, type, channel.id);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '⚙️ Salon logs configuré',
      `**Type :** \`${type}\`\n**Salon :** ${channel}\n**Par :** ${interaction.user.tag}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Salon logs configuré')
      .setDescription(
        `**Type :** \`${type}\`\n` +
        `**Salon :** ${channel}`
      )
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};