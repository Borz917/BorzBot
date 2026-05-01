const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createrole')
    .setDescription('Créer un rôle')
    .addStringOption(option =>
      option.setName('nom').setDescription('Nom du rôle').setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'createrole')) {
      return interaction.reply({ content: '❌ Permission refusée.', ephemeral: true });
    }

    const name = interaction.options.getString('nom');

    const role = await interaction.guild.roles.create({
      name: name,
      reason: `Créé par ${interaction.user.tag}`
    });

    await interaction.reply(`✅ Rôle créé : ${role}`);
  }
};