const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Affiche les informations d’un membre')
    .addUserOption(option =>
      option.setName('membre').setDescription('Membre à vérifier').setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'userinfo')) {
      return interaction.reply({ content: '❌ Tu n’as pas la permission.', ephemeral: true });
    }

    const user = interaction.options.getUser('membre') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const roles = member
      ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `${r}`).join(', ') || 'Aucun'
      : 'Introuvable';

    const embed = new EmbedBuilder()
      .setTitle('👤 Informations utilisateur')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(0x5865f2)
      .addFields(
        { name: 'Utilisateur', value: `${user.tag}`, inline: true },
        { name: 'ID', value: `${user.id}`, inline: true },
        { name: 'Bot', value: user.bot ? 'Oui' : 'Non', inline: true },
        { name: 'Compte créé', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>` },
        { name: 'A rejoint le serveur', value: member?.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'Inconnu' },
        { name: 'Rôles', value: roles.slice(0, 1024) }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};