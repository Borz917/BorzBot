const { EmbedBuilder } = require("discord.js");
const { COLORS } = require("./constants");

function baseEmbed(interaction) {
  return new EmbedBuilder()
    .setFooter({
      text: `BorzBot Pro Max • ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .setTimestamp();
}

module.exports = {
  success(interaction, title, description) {
    return baseEmbed(interaction)
      .setColor(COLORS.SUCCESS)
      .setTitle(`✅ ${title}`)
      .setDescription(description);
  },

  error(interaction, title, description) {
    return baseEmbed(interaction)
      .setColor(COLORS.ERROR)
      .setTitle(`❌ ${title}`)
      .setDescription(description);
  },

  warning(interaction, title, description) {
    return baseEmbed(interaction)
      .setColor(COLORS.WARNING)
      .setTitle(`⚠️ ${title}`)
      .setDescription(description);
  },

  info(interaction, title, description) {
    return baseEmbed(interaction)
      .setColor(COLORS.INFO)
      .setTitle(`ℹ️ ${title}`)
      .setDescription(description);
  }
};