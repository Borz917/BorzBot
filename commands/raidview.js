const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { getServerConfig } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidview')
    .setDescription('Voir la configuration anti-raid'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'raidview')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const config = getServerConfig(interaction.guild.id);
    const raid = config.raid;

    const whitelist = raid.whitelistRoleIds.length > 0
      ? raid.whitelistRoleIds.map(id => `<@&${id}>`).join('\n')
      : 'Aucun';

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Configuration Anti-Raid')
      .setColor(0x5865f2)
      .addFields(
        {
          name: 'Statut',
          value: raid.enabled ? '✅ Activé' : '❌ Désactivé',
          inline: true
        },
        {
          name: 'Limite',
          value: `${raid.joinsLimit} arrivées`,
          inline: true
        },
        {
          name: 'Intervalle',
          value: `${raid.intervalMs / 1000}s`,
          inline: true
        },
        {
          name: 'Action',
          value: `\`${raid.action}\``,
          inline: true
        },
        {
          name: 'Rôles whitelist',
          value: whitelist
        }
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};