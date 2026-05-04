const { SlashCommandBuilder, ChannelType } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { setLogChannel } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configlogs')
    .setDescription('Configure les salons de logs')
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
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configlogs')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const type = interaction.options.getString('type');
    const channel = interaction.options.getChannel('salon');

    setLogChannel(interaction.guild.id, type, channel.id);

    await interaction.reply({
      content: `✅ Logs **${type}** configurés sur ${channel}`,
      ephemeral: true
    });
  }
};