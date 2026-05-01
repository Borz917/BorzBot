const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { clearWarns, getWarns } = require('../utils/warns');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Supprime tous les warns d’un membre')
    .addUserOption(option =>
      option.setName('membre').setDescription('Le membre concerné').setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'clearwarns')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /clearwarns.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const before = getWarns(user.id).length;

    clearWarns(user.id);

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '🧹 Warns supprimés',
      `**Utilisateur :** ${user.tag}\n**ID :** ${user.id}\n**Warns supprimés :** ${before}\n**Modérateur :** ${interaction.user.tag}`,
      0x57f287
    );

    await interaction.reply({
      content: `✅ Tous les warns de ${user.tag} ont été supprimés. Ancien total : **${before}**.`,
      ephemeral: true
    });
  }
};