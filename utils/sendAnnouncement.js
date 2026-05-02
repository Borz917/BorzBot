const { EmbedBuilder } = require('discord.js');

async function sendAnnouncement(interaction, options) {
  const {
    commandName,
    mentionType,
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
  } else if (mentionType === 'role') {
    const role = interaction.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      return interaction.reply({
        content: `❌ Rôle introuvable : **${roleName}**`,
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
