const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Retire le timeout d’un membre')
    .addUserOption(option =>
      option.setName('membre').setDescription('Le membre à unmute').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('raison').setDescription('Raison du unmute').setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'unmute')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /unmute.',
        ephemeral: true
      });
    }

    const member = interaction.options.getMember('membre');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!member) {
      return interaction.reply({
        content: '❌ Membre introuvable.',
        ephemeral: true
      });
    }

    await member.timeout(null, reason);

    await interaction.reply(`🔊 ${member.user.tag} a été unmute.\n**Raison :** ${reason}`);
  }
};