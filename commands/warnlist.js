const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

const {
  getWarns
} = require('../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnlist')
    .setDescription('Voir la liste des avertissements d’un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre à vérifier')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'warnlist')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/warnlist`.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const warns = getWarns(interaction.guild.id, user.id);

    if (!Array.isArray(warns) || warns.length === 0) {
      return interaction.reply({
        content: `✅ ${user.tag} n’a aucun warn.`,
        ephemeral: true
      });
    }

    const warnText = warns
      .map((warn, index) => {
        const date = warn.createdAt
          ? new Date(warn.createdAt).toLocaleString('fr-FR')
          : 'Date inconnue';

        return (
          `**#${index + 1}**\n` +
          `**Raison :** ${warn.reason || 'Aucune raison'}\n` +
          `**Modérateur :** ${warn.moderatorTag || `<@${warn.moderatorId}>` || 'Inconnu'}\n` +
          `**Date :** ${date}`
        );
      })
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('📋 Liste des warns')
      .setDescription(`**Membre :** ${user}\n**Total :** ${warns.length}`)
      .addFields({
        name: 'Avertissements',
        value: warnText.length > 1024
          ? warnText.slice(0, 1000) + '\n\n...'
          : warnText
      })
      .setColor(0xfaa61a)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};