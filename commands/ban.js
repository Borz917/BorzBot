const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannit un membre')
    .addUserOption(option =>
      option.setName('membre').setDescription('Le membre à bannir').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('raison').setDescription('Raison du ban').setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'ban')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /ban.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!member) {
      return interaction.reply({
        content: '❌ Membre introuvable sur le serveur.',
        ephemeral: true
      });
    }

    if (!member.bannable) {
      return interaction.reply({
        content: '❌ Je ne peux pas bannir ce membre.',
        ephemeral: true
      });
    }

    await member.ban({ reason });

    await interaction.reply(`🔨 ${user.tag} a été banni.\n**Raison :** ${reason}`);
  }
};