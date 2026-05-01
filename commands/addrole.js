const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Ajouter un rôle à un ou plusieurs membres')
    .addRoleOption(option =>
      option.setName('role').setDescription('Rôle à ajouter').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('membres')
        .setDescription('IDs des membres séparés par des espaces')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'addrole')) {
      return interaction.reply({ content: '❌ Permission refusée.', ephemeral: true });
    }

    const role = interaction.options.getRole('role');
    const ids = interaction.options.getString('membres').split(' ');

    let success = 0;

    for (const id of ids) {
      const member = await interaction.guild.members.fetch(id).catch(() => null);
      if (!member) continue;

      await member.roles.add(role).catch(() => null);
      success++;
    }

    await interaction.reply(`✅ Rôle ajouté à ${success} membre(s).`);
  }
};