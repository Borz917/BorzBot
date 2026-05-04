const { SlashCommandBuilder, ChannelType } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { setTicketCategory } = require('../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configticketcategory')
    .setDescription('Configure les catégories de tickets')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type de ticket')
        .setRequired(true)
        .addChoices(
          { name: 'Boutique', value: 'boutique' },
          { name: 'Support', value: 'support' },
          { name: 'Recrutement', value: 'recrutement' },
          { name: 'Illégal', value: 'illegal' },
          { name: 'Légal', value: 'legal' },
          { name: 'Unban', value: 'unban' },
          { name: 'Fonda', value: 'fonda' },
          { name: 'Plainte Staff', value: 'plainte_staff' }
        )
    )
    .addChannelOption(option =>
      option
        .setName('categorie')
        .setDescription('Catégorie Discord')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'configticketcategory')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const type = interaction.options.getString('type');
    const category = interaction.options.getChannel('categorie');

    setTicketCategory(interaction.guild.id, type, category.id);

    await interaction.reply({
      content: `✅ Catégorie ticket **${type}** configurée : **${category.name}**`,
      ephemeral: true
    });
  }
};