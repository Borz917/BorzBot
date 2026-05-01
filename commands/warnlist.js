const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { getWarns } = require('../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnlist')
    .setDescription('Affiche les avertissements d’un membre')
    .addUserOption(option =>
      option.setName('membre').setDescription('Le membre à vérifier').setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'warnlist')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /warnlist.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const warns = getWarns(user.id);

    if (warns.length === 0) {
      return interaction.reply({
        content: `✅ ${user.tag} n’a aucun avertissement.`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warns de ${user.tag}`)
      .setDescription(
        warns.map((warn, index) =>
          `**${index + 1}.** ${warn.reason}\nModérateur: <@${warn.moderatorId || interaction.user.id}>`
        ).join('\n\n')
      )
      .setColor(0xffcc66)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};