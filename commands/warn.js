const { SlashCommandBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');
const { addWarn, getWarns } = require('../utils/warns');
const sendDiscordLog = require('../utils/sendDiscordLog');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Ajoute un avertissement')
    .addUserOption(option =>
      option.setName('membre').setDescription('Le membre à avertir').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('raison').setDescription('Raison du warn').setRequired(true)
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'warn')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser /warn.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('membre');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const reason = interaction.options.getString('raison');

    if (!member) {
      return interaction.reply({
        content: '❌ Membre introuvable.',
        ephemeral: true
      });
    }

    addWarn(user.id, reason, interaction.user.id);
    const total = getWarns(user.id).length;

    await sendDiscordLog(
      interaction.guild,
      'moderation-logs',
      '⚠️ Avertissement',
      `**Utilisateur :** ${user.tag}\n**ID :** ${user.id}\n**Modérateur :** ${interaction.user.tag}\n**Total warns :** ${total}\n**Raison :** ${reason}`,
      0xffcc66
    );

    let autoAction = '';

    if (total === 3) {
      if (member.moderatable) {
        await member.timeout(30 * 60 * 1000, 'Auto-sanction : 3 warns').catch(() => null);
        autoAction = '\n🔇 Auto-sanction : mute 30 minutes.';
      }
    }

    if (total === 5) {
      if (member.kickable) {
        await member.kick('Auto-sanction : 5 warns').catch(() => null);
        autoAction = '\n👢 Auto-sanction : kick.';
      }
    }

    if (total >= 7) {
      if (member.bannable) {
        await member.ban({ reason: 'Auto-sanction : 7 warns' }).catch(() => null);
        autoAction = '\n🔨 Auto-sanction : ban.';
      }
    }

    if (autoAction) {
      await sendDiscordLog(
        interaction.guild,
        'moderation-logs',
        '🤖 Auto-sanction',
        `**Utilisateur :** ${user.tag}\n**ID :** ${user.id}\n**Total warns :** ${total}${autoAction}`,
        0xed4245
      );
    }

    await interaction.reply(
      `⚠️ ${user.tag} a reçu un avertissement.\n` +
      `**Total :** ${total}\n` +
      `**Raison :** ${reason}` +
      autoAction
    );
  }
};