const { EmbedBuilder } = require('discord.js');
const { getServerConfig } = require('./serverConfig');

const notifFallbackNames = {
  illegal: 'Notification Illégal',
  legal: 'Notification Légal',
  giveaways: 'Notification Giveaways',
  evenement: 'Notification Événement'
};

async function sendAnnouncement(interaction, options) {
  const {
    commandName,
    mentionType,
    notifType,
    roleName,
    title,
    color,
    emoji
  } = options;

  const hasPermission = require('./hasPermission');

  if (!hasPermission(interaction.member, commandName)) {
    return interaction.reply({
      content: '❌ Tu n’as pas la permission d’utiliser cette commande.',
      ephemeral: true
    });
  }

  const message = interaction.options.getString('message');

  let mention = '';
  let allowedMentions = {};

  if (mentionType === 'everyone') {
    mention = '@everyone';
    allowedMentions = {
      parse: ['everyone']
    };
  }

  if (mentionType === 'role') {
    const config = getServerConfig(interaction.guild.id);

    let role = null;

    if (notifType && config.notifRoles[notifType]) {
      role = interaction.guild.roles.cache.get(config.notifRoles[notifType]);
    }

    if (!role) {
      const fallbackName = roleName || notifFallbackNames[notifType];
      role = interaction.guild.roles.cache.find(r => r.name === fallbackName);
    }

    if (!role) {
      return interaction.reply({
        content: `❌ Rôle notification introuvable. Configure-le avec /confignotifrole.`,
        ephemeral: true
      });
    }

    mention = `<@&${role.id}>`;
    allowedMentions = {
      roles: [role.id]
    };
  }

  const embed = new EmbedBuilder()
    .setTitle(`${emoji} ${title}`)
    .setDescription(message)
    .setColor(color)
    .setFooter({
      text: `Annonce publiée par ${interaction.user.tag}`
    })
    .setTimestamp();

  await interaction.channel.send({
    content: mention,
    embeds: [embed],
    allowedMentions
  });

  await interaction.reply({
    content: '✅ Annonce envoyée.',
    ephemeral: true
  });
}

module.exports = sendAnnouncement;