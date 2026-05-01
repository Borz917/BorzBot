const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Retirer un rôle à un ou plusieurs membres')
    .addRoleOption(option =>
      option.setName('role').setDescription('Rôle à retirer').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('membres')
        .setDescription('IDs des membres séparés par des espaces')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'removerole')) {
      return interaction.reply({ content: '❌ Permission refusée.', ephemeral: true });
    }

    const role = interaction.options.getRole('role');
    const ids = interaction.options.getString('membres').split(' ');

    let success = 0;

    for (const id of ids) {
      const member = await interaction.guild.members.fetch(id).catch(() => null);
      if (!member) continue;

      await member.roles.remove(role).catch(() => null);
      success++;
    }

    await interaction.reply(`✅ Rôle retiré à ${success} membre(s).`);
  }
};