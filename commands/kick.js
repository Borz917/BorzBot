const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulse un membre')
    .addUserOption(option =>
      option.setName('membre').setDescription('Le membre à expulser').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('raison').setDescription('Raison du kick').setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'kick')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /kick.',
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

    if (!member.kickable) {
      return interaction.reply({
        content: '❌ Je ne peux pas expulser ce membre.',
        ephemeral: true
      });
    }

    const tag = member.user.tag;

    await member.kick(reason);

    await interaction.reply(`👢 ${tag} a été expulsé.\n**Raison :** ${reason}`);
  }
};