const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

const {
  addRaidWhitelistRole,
  removeRaidWhitelistRole
} = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidwhitelist')
    .setDescription('Ajouter ou retirer un rôle whitelist anti-raid')
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Action')
        .setRequired(true)
        .addChoices(
          { name: 'Ajouter', value: 'add' },
          { name: 'Retirer', value: 'remove' }
        )
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Rôle whitelist')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidwhitelist')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const action = interaction.options.getString('action');
    const role = interaction.options.getRole('role');

    if (action === 'add') {
      addRaidWhitelistRole(interaction.guild.id, role.id);

      return interaction.reply({
        content: `✅ Rôle ajouté à la whitelist anti-raid : ${role}`,
        ephemeral: true
      });
    }

    removeRaidWhitelistRole(interaction.guild.id, role.id);

    return interaction.reply({
      content: `✅ Rôle retiré de la whitelist anti-raid : ${role}`,
      ephemeral: true
    });
  }
};