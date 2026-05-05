const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { lockGuild } = require('../utils/raidLockHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidlock')
    .setDescription('Verrouiller les salons textuels du serveur')
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du verrouillage')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidlock')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/raidlock`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les salons`.',
        ephemeral: true
      });
    }

    const reason = interaction.options.getString('raison') || 'Raid lock manuel';

    await interaction.deferReply({
      ephemeral: true
    });

    const result = await lockGuild(
      interaction.guild,
      interaction.user.tag,
      `${reason} | Par ${interaction.user.tag}`
    );

    const embed = new EmbedBuilder()
      .setTitle('🚨 Raidlock activé')
      .setDescription(
        `**Salons verrouillés :** ${result.lockedCount}\n` +
        `**Échecs :** ${result.failedCount}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0xed4245)
      .setTimestamp();

    return interaction.editReply({
      embeds: [embed]
    });
  }
};