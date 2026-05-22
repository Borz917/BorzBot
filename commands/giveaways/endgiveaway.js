const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const reply = require('../../utils/reply');
module.exports = {
  data: new SlashCommandBuilder().setName("endgiveaway").setDescription("Commande endgiveaway.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    return reply.success(interaction, 'Commande exécutée', `✅ Commande /endgiveaway exécutée.`, { ephemeral: false });
  }
};
