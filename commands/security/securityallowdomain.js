const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendDiscordLog');

const {
  getServerConfig,
  addAllowedDomain,
  removeAllowedDomain
} = require('../../utils/serverConfig');

function cleanDomain(domain) {
  return String(domain || '')
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('securityallowdomain')
    .setDescription('Gérer les domaines autorisés par l’anti-link')
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Action à effectuer')
        .setRequired(true)
        .addChoices(
          { name: 'Ajouter un domaine', value: 'add' },
          { name: 'Retirer un domaine', value: 'remove' },
          { name: 'Voir les domaines autorisés', value: 'list' }
        )
    )
    .addStringOption(option =>
      option
        .setName('domaine')
        .setDescription('Domaine à ajouter ou retirer, exemple : discord.gg')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'securityallowdomain')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/securityallowdomain`.',
        ephemeral: true
      });
    }

    const action = interaction.options.getString('action');
    const domainInput = interaction.options.getString('domaine');

    if ((action === 'add' || action === 'remove') && !domainInput) {
      return interaction.reply({
        content: '❌ Tu dois préciser un domaine.',
        ephemeral: true
      });
    }

    if (action === 'add') {
      const domain = cleanDomain(domainInput);

      if (!domain || !domain.includes('.')) {
        return interaction.reply({
          content: '❌ Domaine invalide. Exemple correct : `discord.gg`',
          ephemeral: true
        });
      }

      addAllowedDomain(interaction.guild.id, domain);

      await sendDiscordLog(
        interaction.guild,
        'moderation-logs',
        '🔗 Domaine autorisé ajouté',
        `**Domaine :** \`${domain}\`\n**Modérateur :** ${interaction.user.tag}`,
        0x57f287
      );

      return interaction.reply({
        content: `✅ Le domaine \`${domain}\` est maintenant autorisé.`,
        ephemeral: true
      });
    }

    if (action === 'remove') {
      const domain = cleanDomain(domainInput);

      removeAllowedDomain(interaction.guild.id, domain);

      await sendDiscordLog(
        interaction.guild,
        'moderation-logs',
        '🔗 Domaine autorisé retiré',
        `**Domaine :** \`${domain}\`\n**Modérateur :** ${interaction.user.tag}`,
        0xed4245
      );

      return interaction.reply({
        content: `✅ Le domaine \`${domain}\` a été retiré des domaines autorisés.`,
        ephemeral: true
      });
    }

    const config = getServerConfig(interaction.guild.id);
    const domains = config.security?.antiLink?.allowedDomains || [];

    const text =
      domains.length > 0
        ? domains.map(domain => `• \`${domain}\``).join('\n')
        : 'Aucun domaine autorisé.';

    const embed = new EmbedBuilder()
      .setTitle('🔗 Domaines autorisés')
      .setDescription(text)
      .setColor(0x5865f2)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};