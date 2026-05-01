const { ChannelType, PermissionsBitField } = require('discord.js');
const ticketConfig = require('../config/ticketConfig');

async function createTicketChannel(guild, user, subject) {
  const category = guild.channels.cache.find(
    c => c.name === ticketConfig.ticketCategoryName && c.type === ChannelType.GuildCategory
  );

  if (!category) {
    throw new Error(`Catégorie introuvable : ${ticketConfig.ticketCategoryName}`);
  }

  const staffRole = guild.roles.cache.find(r => r.name === ticketConfig.staffRoleName);

  const safeName = (user.username || user.id)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 16);

  const channel = await guild.channels.create({
    name: `ticket-${safeName}`,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: [
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
          PermissionsBitField.Flags.ManageChannels,
          PermissionsBitField.Flags.ManageMessages
        ]
      },
      ...(staffRole
        ? [{
            id: staffRole.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }]
        : [])
    ]
  });

  await channel.setTopic(`Ticket de ${user.tag} (${user.id}) | Sujet : ${subject}`);

  return channel;
}

module.exports = createTicketChannel;