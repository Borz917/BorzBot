const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Débannit un utilisateur')
    .addStringOption(option =>
      option.setName('userid').setDescription('ID du membre à débannir').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('raison').setDescription('Raison du unban').setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'unban')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /unban.',
        ephemeral: true
      });
    }

    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    try {
      await interaction.guild.members.unban(userId, reason);

      await interaction.reply(`✅ L’utilisateur avec l’ID \`${userId}\` a été débanni.\n**Raison :** ${reason}`);
    } catch {
      await interaction.reply({
        content: '❌ Impossible de débannir cet utilisateur.',
        ephemeral: true
      });
    }
  }
};