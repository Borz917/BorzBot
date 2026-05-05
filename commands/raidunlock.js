const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { unlockGuild } = require('../utils/raidLockHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidunlock')
    .setDescription('Déverrouiller les salons textuels du serveur')
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du déverrouillage')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidunlock')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/raidunlock`.',
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ Je n’ai pas la permission `Gérer les salons`.',
        ephemeral: true
      });
    }

    const reason = interaction.options.getString('raison') || 'Raid unlock manuel';

    await interaction.deferReply({
      ephemeral: true
    });

    const result = await unlockGuild(
      interaction.guild,
      interaction.user.tag,
      `${reason} | Par ${interaction.user.tag}`
    );

    const embed = new EmbedBuilder()
      .setTitle('✅ Raidlock désactivé')
      .setDescription(
        `**Salons déverrouillés :** ${result.unlockedCount}\n` +
        `**Échecs :** ${result.failedCount}\n` +
        `**Raison :** ${reason}`
      )
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.editReply({
      embeds: [embed]
    });
  }
};