const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const reply = require('../../utils/reply');
module.exports = {
  data: new SlashCommandBuilder().setName("creategiveaway").setDescription("Commande creategiveaway.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    return reply.success(interaction, 'Commande exécutée', `✅ Commande /creategiveaway exécutée.`, { ephemeral: false });
  }
};
