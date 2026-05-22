const embeds = require("./embeds");

async function success(interaction, title, description) {
  return interaction.reply({
    embeds: [
      embeds.success(interaction, title, description)
    ]
  });
}

async function error(interaction, title, description) {
  return interaction.reply({
    embeds: [
      embeds.error(interaction, title, description)
    ],
    ephemeral: true
  });
}

async function warning(interaction, title, description) {
  return interaction.reply({
    embeds: [
      embeds.warning(interaction, title, description)
    ],
    ephemeral: true
  });
}

async function info(interaction, title, description) {
  return interaction.reply({
    embeds: [
      embeds.info(interaction, title, description)
    ]
  });
}

module.exports = {
  success,
  error,
  warning,
  info
};