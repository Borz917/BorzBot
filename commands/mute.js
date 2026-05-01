const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout un membre')
    .addUserOption(option =>
      option.setName('membre').setDescription('Le membre à mute').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duree').setDescription('Durée en minutes').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('raison').setDescription('Raison du mute').setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'mute')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /mute.',
        ephemeral: true
      });
    }

    const member = interaction.options.getMember('membre');
    const duration = interaction.options.getInteger('duree');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    if (!member) {
      return interaction.reply({
        content: '❌ Membre introuvable.',
        ephemeral: true
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: '❌ Je ne peux pas mute ce membre.',
        ephemeral: true
      });
    }

    await member.timeout(duration * 60 * 1000, reason);

    await interaction.reply(`🔇 ${member.user.tag} a été mute ${duration} minute(s).\n**Raison :** ${reason}`);
  }
};