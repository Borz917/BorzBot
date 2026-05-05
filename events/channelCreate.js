const { Events, ChannelType } = require('discord.js');
const sendDiscordLog = require('../utils/sendDiscordLog');

function getChannelTypeName(type) {
  const types = {
    [ChannelType.GuildText]: 'Salon textuel',
    [ChannelType.GuildVoice]: 'Salon vocal',
    [ChannelType.GuildCategory]: 'Catégorie',
    [ChannelType.GuildAnnouncement]: 'Salon annonce',
    [ChannelType.GuildStageVoice]: 'Stage',
    [ChannelType.GuildForum]: 'Forum'
  };

  return types[type] || `Type ${type}`;
}

module.exports = {
  name: Events.ChannelCreate,

  async execute(channel) {
    try {
      if (!channel.guild) return;

      await sendDiscordLog(
        channel.guild,
        'moderation-logs',
        '➕ Salon créé',
        `**Salon :** ${channel}\n` +
        `**Nom :** \`${channel.name}\`\n` +
        `**ID :** \`${channel.id}\`\n` +
        `**Type :** ${getChannelTypeName(channel.type)}\n` +
        `**Catégorie :** ${channel.parent ? channel.parent.name : 'Aucune'}`,
        0x57f287
      );
    } catch (error) {
      console.error('Erreur channelCreate :', error);
    }
  }
};