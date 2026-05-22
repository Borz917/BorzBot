const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const hasPermission = require('../../utils/hasPermission');
const sendDiscordLog = require('../../utils/sendTicketLog');
const { setTicketCategory } = require('../../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configticketcategory')
    .setDescription('Configurer les catégories de tickets')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type de ticket')
        .setRequired(true)
        .addChoices(
          { name: 'Boutique', value: 'boutique' },
          { name: 'Support général', value: 'support' },
          { name: 'Recrutement', value: 'recrutement' },
          { name: 'Pôle illégal', value: 'illegal' },
          { name: 'Pôle légal', value: 'legal' },
          { name: 'Demande unban', value: 'unban' },
          { name: 'Contact fonda', value: 'fonda' },
          { name: 'Plainte staff', value: 'plainte_staff' }
        )
    )
    .addChannelOption(option =>
      option
        .setName('categorie')
        .setDescription('Catégorie où créer les tickets')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configticketcategory')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/configticketcategory`.',
        ephemeral: true
      });
    }

    const type = interaction.options.getString('type');
    const category = interaction.options.getChannel('categorie');

    setTicketCategory(interaction.guild.id, type, category.id);

    await sendDiscordLog(
      interaction.guild,
      type,
      '🎫 Catégorie ticket configurée',
      `**Type :** \`${type}\`\n**Catégorie :** ${category.name}\n**Par :** ${interaction.user.tag}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('🎫 Catégorie ticket configurée')
      .setDescription(
        `**Type :** \`${type}\`\n` +
        `**Catégorie :** ${category.name}`
      )
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};