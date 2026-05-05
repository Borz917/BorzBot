const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const sendDiscordLog = require('../utils/sendDiscordLog');

const {
  getWarns,
  removeWarn
} = require('../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Retirer un avertissement à un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre concerné')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('numero')
        .setDescription('Numéro du warn à retirer')
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option
        .setName('raison')
        .setDescription('Raison du retrait du warn')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'unwarn')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser `/unwarn`.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const warnNumber = interaction.options.getInteger('numero');
    const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

    const warns = getWarns(interaction.guild.id, user.id);

    if (!Array.isArray(warns) || warns.length === 0) {
      return interaction.reply({
        content: `❌ ${user.tag} n’a aucun warn.`,
        ephemeral: true
      });
    }

    if (warnNumber > warns.length) {
      return interaction.reply({
        content: `❌ Warn invalide. Ce membre a seulement **${warns.length}** warn(s).`,
        ephemeral: true
      });
    }

    const removedWarn = warns[warnNumber - 1];

    removeWarn(interaction.guild.id, user.id, warnNumber - 1);

    const newWarns = getWarns(interaction.guild.id, user.id);
    const totalWarns = Array.isArray(newWarns) ? newWarns.length : 0;

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '✅ Warn retiré',
      `**Utilisateur :** ${user.tag}\n` +
      `**ID :** ${user.id}\n` +
      `**Modérateur :** ${interaction.user.tag}\n` +
      `**Warn retiré :** #${warnNumber}\n` +
      `**Ancienne raison :** ${removedWarn?.reason || 'Inconnue'}\n` +
      `**Raison du retrait :** ${reason}\n` +
      `**Warns restants :** ${totalWarns}`,
      0x57f287
    );

    const embed = new EmbedBuilder()
      .setTitle('✅ Warn retiré')
      .setDescription(
        `**Membre :** ${user.tag}\n` +
        `**Warn retiré :** #${warnNumber}\n` +
        `**Ancienne raison :** ${removedWarn?.reason || 'Inconnue'}\n` +
        `**Raison du retrait :** ${reason}\n` +
        `**Warns restants :** ${totalWarns}`
      )
      .setColor(0x57f287)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
};