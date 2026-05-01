const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche les commandes que tu peux utiliser'),

  async execute(interaction) {
    if (!hasPermission(interaction.member, 'help')) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission.',
        ephemeral: true
      });
    }

    const sections = [];

    const moderationCommands = [];
    const warnCommands = [];
    const roleCommands = [];
    const ticketCommands = [];
    const funCommands = [];
    const generalCommands = [];

    // =========================
    // MODÉRATION
    // =========================
    if (hasPermission(interaction.member, 'ban')) {
      moderationCommands.push('`/ban` → Bannir un membre');
    }

    if (hasPermission(interaction.member, 'unban')) {
      moderationCommands.push('`/unban` → Débannir un membre');
    }

    if (hasPermission(interaction.member, 'kick')) {
      moderationCommands.push('`/kick` → Expulser un membre');
    }

    if (hasPermission(interaction.member, 'mute')) {
      moderationCommands.push('`/mute` → Timeout un membre');
    }

    if (hasPermission(interaction.member, 'unmute')) {
      moderationCommands.push('`/unmute` → Retirer un timeout');
    }

    if (hasPermission(interaction.member, 'clear')) {
      moderationCommands.push('`/clear` → Supprimer des messages');
    }

    if (hasPermission(interaction.member, 'lock')) {
      moderationCommands.push('`/lock` → Verrouiller un salon');
    }

    if (hasPermission(interaction.member, 'unlock')) {
      moderationCommands.push('`/unlock` → Déverrouiller un salon');
    }

    if (hasPermission(interaction.member, 'slowmode')) {
      moderationCommands.push('`/slowmode` → Modifier le slowmode');
    }

    // =========================
    // AVERTISSEMENTS
    // =========================
    if (hasPermission(interaction.member, 'warn')) {
      warnCommands.push('`/warn` → Ajouter un avertissement');
    }

    if (hasPermission(interaction.member, 'unwarn')) {
      warnCommands.push('`/unwarn` → Retirer un avertissement');
    }

    if (hasPermission(interaction.member, 'warnlist')) {
      warnCommands.push('`/warnlist` → Voir les avertissements');
    }

    if (hasPermission(interaction.member, 'clearwarns')) {
      warnCommands.push('`/clearwarns` → Supprimer tous les warns');
    }

    // =========================
    // RÔLES
    // =========================
    if (hasPermission(interaction.member, 'addrole')) {
      roleCommands.push('`/addrole` → Ajouter un rôle');
    }

    if (hasPermission(interaction.member, 'removerole')) {
      roleCommands.push('`/removerole` → Retirer un rôle');
    }

    if (hasPermission(interaction.member, 'createrole')) {
      roleCommands.push('`/createrole` → Créer un rôle');
    }

    if (hasPermission(interaction.member, 'deleterole')) {
      roleCommands.push('`/deleterole` → Supprimer un rôle');
    }

    if (hasPermission(interaction.member, 'sendnotifroles')) {
      roleCommands.push('`/sendnotifroles` → Envoyer les rôles notifications');
    }

    // =========================
    // TICKETS
    // =========================
    if (hasPermission(interaction.member, 'sendticketpanel')) {
      ticketCommands.push('`/sendticketpanel` → Envoyer le panel ticket');
    }

    if (hasPermission(interaction.member, 'close')) {
      ticketCommands.push('`/close` → Fermer un ticket');
    }

    if (hasPermission(interaction.member, 'forceclose')) {
      ticketCommands.push('`/forceclose` → Fermer un ticket cassé');
    }

    if (hasPermission(interaction.member, 'ticketinfo')) {
      ticketCommands.push('`/ticketinfo` → Voir les infos du ticket');
    }

    if (hasPermission(interaction.member, 'addticketmember')) {
      ticketCommands.push('`/addticketmember` → Ajouter un membre au ticket');
    }

    if (hasPermission(interaction.member, 'removeticketmember')) {
      ticketCommands.push('`/removeticketmember` → Retirer un membre du ticket');
    }

    if (hasPermission(interaction.member, 'renameticket')) {
      ticketCommands.push('`/renameticket` → Renommer un ticket');
    }

    // =========================
    // MINI-JEUX
    // =========================
    if (hasPermission(interaction.member, 'coinflip')) {
      funCommands.push('`/coinflip` → Pile ou face');
    }

    if (hasPermission(interaction.member, 'dice')) {
      funCommands.push('`/dice` → Lancer un dé');
    }

    if (hasPermission(interaction.member, 'rps')) {
      funCommands.push('`/rps` → Pierre, feuille, ciseaux');
    }

    if (hasPermission(interaction.member, 'duel')) {
      funCommands.push('`/duel` → Duel 1vs1');
    }

    if (hasPermission(interaction.member, 'rank')) {
      funCommands.push('`/rank` → Voir ton rank 1vs1');
    }

    if (hasPermission(interaction.member, 'leaderboard')) {
      funCommands.push('`/leaderboard` → Classement ranked');
    }

    // =========================
    // GÉNÉRAL / ADMIN
    // =========================
    if (hasPermission(interaction.member, 'help')) {
      generalCommands.push('`/help` → Afficher ce menu');
    }

    if (hasPermission(interaction.member, 'userinfo')) {
      generalCommands.push('`/userinfo` → Infos utilisateur');
    }

    if (hasPermission(interaction.member, 'serverinfo')) {
      generalCommands.push('`/serverinfo` → Infos serveur');
    }

    if (hasPermission(interaction.member, 'invitelogs')) {
      generalCommands.push('`/invitelogs` → Voir les invitations');
    }

    if (hasPermission(interaction.member, 'resetinvites')) {
      generalCommands.push('`/resetinvites` → Reset les invitations');
    }

    if (hasPermission(interaction.member, 'resetrank')) {
      generalCommands.push('`/resetrank` → Reset le rank d’un joueur');
    }

    // =========================
    // SECTIONS
    // =========================
    if (moderationCommands.length) {
      sections.push({
        name: '🔨 Modération',
        value: moderationCommands.join('\n')
      });
    }

    if (warnCommands.length) {
      sections.push({
        name: '⚠️ Avertissements',
        value: warnCommands.join('\n')
      });
    }

    if (roleCommands.length) {
      sections.push({
        name: '🎭 Rôles',
        value: roleCommands.join('\n')
      });
    }

    if (ticketCommands.length) {
      sections.push({
        name: '🎫 Tickets',
        value: ticketCommands.join('\n')
      });
    }

    if (funCommands.length) {
      sections.push({
        name: '🎮 Mini-jeux',
        value: funCommands.join('\n')
      });
    }

    if (generalCommands.length) {
      sections.push({
        name: '⚙️ Général',
        value: generalCommands.join('\n')
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📘 BorzBot • Aide')
      .setDescription('Voici les commandes disponibles selon tes permissions.')
      .setColor(0x5865f2)
      .addFields(sections)
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};