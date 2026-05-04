const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const hasPermission = require('../utils/hasPermission');

function addCommand(list, member, permissionName, text) {
  if (hasPermission(member, permissionName)) {
    list.push(text);
  }
}

function addSection(sections, name, commands) {
  if (!commands.length) return;

  let current = '';
  let part = 1;

  for (const command of commands) {
    const line = `${command}\n`;

    if ((current + line).length > 1000) {
      sections.push({
        name: part === 1 ? name : `${name} (${part})`,
        value: current.trim()
      });

      part++;
      current = line;
    } else {
      current += line;
    }
  }

  if (current.trim().length > 0) {
    sections.push({
      name: part === 1 ? name : `${name} (${part})`,
      value: current.trim()
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche les commandes disponibles'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sections = [];

    const generalCommands = [];
    const funCommands = [];
    const ticketCommands = [];
    const moderationCommands = [];
    const warnCommands = [];
    const roleCommands = [];
    const annonceCommands = [];
    const securityCommands = [];
    const configCommands = [];
    const staffCommands = [];

    // =========================
    // GÉNÉRAL
    // =========================
    addCommand(generalCommands, interaction.member, 'help', '`/help` → Afficher ce menu');
    addCommand(generalCommands, interaction.member, 'userinfo', '`/userinfo` → Infos utilisateur');
    addCommand(generalCommands, interaction.member, 'serverinfo', '`/serverinfo` → Infos serveur');
    addCommand(generalCommands, interaction.member, 'botinfo', '`/botinfo` → Infos du bot');
    addCommand(generalCommands, interaction.member, 'invite', '`/invite` → Inviter le bot');
    addCommand(generalCommands, interaction.member, 'support', '`/support` → Serveur support');
    addCommand(generalCommands, interaction.member, 'invitelogs', '`/invitelogs` → Voir les invitations');

    // =========================
    // MINI-JEUX
    // =========================
    addCommand(funCommands, interaction.member, 'coinflip', '`/coinflip` → Pile ou face');
    addCommand(funCommands, interaction.member, 'dice', '`/dice` → Lancer un dé');
    addCommand(funCommands, interaction.member, 'rps', '`/rps` → Pierre, feuille, ciseaux');
    addCommand(funCommands, interaction.member, 'duel', '`/duel` → Duel 1vs1');
    addCommand(funCommands, interaction.member, 'rank', '`/rank` → Voir ton rank 1vs1');
    addCommand(funCommands, interaction.member, 'leaderboard', '`/leaderboard` → Classement ranked');

    // =========================
    // TICKETS
    // =========================
    addCommand(ticketCommands, interaction.member, 'ticketinfo', '`/ticketinfo` → Voir les infos du ticket');
    addCommand(ticketCommands, interaction.member, 'sendticketpanel', '`/sendticketpanel` → Envoyer le panel ticket');
    addCommand(ticketCommands, interaction.member, 'close', '`/close` → Fermer un ticket');
    addCommand(ticketCommands, interaction.member, 'forceclose', '`/forceclose` → Fermer un ticket cassé');
    addCommand(ticketCommands, interaction.member, 'addticketmember', '`/addticketmember` → Ajouter un membre au ticket');
    addCommand(ticketCommands, interaction.member, 'removeticketmember', '`/removeticketmember` → Retirer un membre du ticket');
    addCommand(ticketCommands, interaction.member, 'renameticket', '`/renameticket` → Renommer un ticket');

    // =========================
    // MODÉRATION
    // =========================
    addCommand(moderationCommands, interaction.member, 'ban', '`/ban` → Bannir un membre');
    addCommand(moderationCommands, interaction.member, 'unban', '`/unban` → Débannir un membre');
    addCommand(moderationCommands, interaction.member, 'kick', '`/kick` → Expulser un membre');
    addCommand(moderationCommands, interaction.member, 'mute', '`/mute` → Timeout un membre');
    addCommand(moderationCommands, interaction.member, 'unmute', '`/unmute` → Retirer un timeout');
    addCommand(moderationCommands, interaction.member, 'clear', '`/clear` → Supprimer des messages');
    addCommand(moderationCommands, interaction.member, 'lock', '`/lock` → Verrouiller un salon');
    addCommand(moderationCommands, interaction.member, 'unlock', '`/unlock` → Déverrouiller un salon');
    addCommand(moderationCommands, interaction.member, 'slowmode', '`/slowmode` → Modifier le slowmode');

    // =========================
    // AVERTISSEMENTS
    // =========================
    addCommand(warnCommands, interaction.member, 'warn', '`/warn` → Ajouter un avertissement');
    addCommand(warnCommands, interaction.member, 'unwarn', '`/unwarn` → Retirer un avertissement');
    addCommand(warnCommands, interaction.member, 'warnlist', '`/warnlist` → Voir les avertissements');
    addCommand(warnCommands, interaction.member, 'clearwarns', '`/clearwarns` → Supprimer tous les warns');

    // =========================
    // RÔLES
    // =========================
    addCommand(roleCommands, interaction.member, 'addrole', '`/addrole` → Ajouter un rôle');
    addCommand(roleCommands, interaction.member, 'removerole', '`/removerole` → Retirer un rôle');
    addCommand(roleCommands, interaction.member, 'createrole', '`/createrole` → Créer un rôle');
    addCommand(roleCommands, interaction.member, 'deleterole', '`/deleterole` → Supprimer un rôle');
    addCommand(roleCommands, interaction.member, 'sendnotifroles', '`/sendnotifroles` → Envoyer les rôles notifications');

    // =========================
    // ANNONCES
    // =========================
    addCommand(annonceCommands, interaction.member, 'annonceserveur', '`/annonceserveur` → Annonce avec @everyone');
    addCommand(annonceCommands, interaction.member, 'annonceillegal', '`/annonceillegal` → Annonce Illégal');
    addCommand(annonceCommands, interaction.member, 'annoncelegal', '`/annoncelegal` → Annonce Légal');
    addCommand(annonceCommands, interaction.member, 'annoncegiveaways', '`/annoncegiveaways` → Annonce Giveaways');
    addCommand(annonceCommands, interaction.member, 'annonceevenement', '`/annonceevenement` → Annonce Événement');

    // =========================
    // INVITATIONS / GIVEAWAYS
    // =========================
    addCommand(generalCommands, interaction.member, 'sendinvitepanel', '`/sendinvitepanel` → Envoyer le panel invitations');
    addCommand(generalCommands, interaction.member, 'creategiveaway', '`/creategiveaway` → Créer un giveaway invitations');
    addCommand(generalCommands, interaction.member, 'endgiveaway', '`/endgiveaway` → Supprimer un giveaway invitations');
    addCommand(generalCommands, interaction.member, 'resetinvites', '`/resetinvites` → Reset les invitations');

    // =========================
    // CONFIGURATION
    // =========================
    addCommand(configCommands, interaction.member, 'configview', '`/configview` → Voir la configuration serveur');
    addCommand(configCommands, interaction.member, 'configstaffrole', '`/configstaffrole` → Configurer le rôle staff');
    addCommand(configCommands, interaction.member, 'configlogs', '`/configlogs` → Configurer les salons logs');
    addCommand(configCommands, interaction.member, 'confignotifrole', '`/confignotifrole` → Configurer les rôles notifications');
    addCommand(configCommands, interaction.member, 'configticketcategory', '`/configticketcategory` → Configurer les catégories tickets');
    addCommand(configCommands, interaction.member, 'configreset', '`/configreset` → Réinitialiser la configuration serveur');
    addCommand(configCommands, interaction.member, 'setupbot', '`/setupbot` → Créer les salons logs nécessaires');
    addCommand(configCommands, interaction.member, 'diagnostic', '`/diagnostic` → Vérifier la configuration du bot');

    // =========================
    // SÉCURITÉ
    // =========================
    addCommand(securityCommands, interaction.member, 'securityview', '`/securityview` → Voir la configuration sécurité');
    addCommand(securityCommands, interaction.member, 'securityspam', '`/securityspam` → Configurer l’anti-spam');
    addCommand(securityCommands, interaction.member, 'securitylink', '`/securitylink` → Configurer l’anti-link');
    addCommand(securityCommands, interaction.member, 'securityignore', '`/securityignore` → Ignorer un rôle sécurité');
    addCommand(securityCommands, interaction.member, 'securityallowdomain', '`/securityallowdomain` → Gérer les domaines autorisés');
    addCommand(securityCommands, interaction.member, 'raidview', '`/raidview` → Voir la config anti-raid');
    addCommand(securityCommands, interaction.member, 'raidconfig', '`/raidconfig` → Configurer l’anti-raid');
    addCommand(securityCommands, interaction.member, 'raidlock', '`/raidlock` → Verrouiller le serveur');
    addCommand(securityCommands, interaction.member, 'raidunlock', '`/raidunlock` → Déverrouiller le serveur');
    addCommand(securityCommands, interaction.member, 'raidwhitelist', '`/raidwhitelist` → Gérer la whitelist anti-raid');

    // =========================
    // STAFF
    // =========================
    addCommand(staffCommands, interaction.member, 'staffstats', '`/staffstats` → Voir les stats staff');
    addCommand(staffCommands, interaction.member, 'stafftop', '`/stafftop` → Top staff actif');
    addCommand(staffCommands, interaction.member, 'resetstaffstats', '`/resetstaffstats` → Reset les stats staff');
    addCommand(staffCommands, interaction.member, 'resetrank', '`/resetrank` → Reset le rank d’un joueur');

    // =========================
    // SECTIONS
    // =========================
    addSection(sections, '⚙️ Général', generalCommands);
    addSection(sections, '🎮 Mini-jeux', funCommands);
    addSection(sections, '🎫 Tickets', ticketCommands);
    addSection(sections, '🔨 Modération', moderationCommands);
    addSection(sections, '⚠️ Avertissements', warnCommands);
    addSection(sections, '🎭 Rôles', roleCommands);
    addSection(sections, '📢 Annonces', annonceCommands);
    addSection(sections, '🛡️ Sécurité', securityCommands);
    addSection(sections, '🧩 Configuration', configCommands);
    addSection(sections, '📊 Staff', staffCommands);

    const embed = new EmbedBuilder()
      .setTitle('📘 BorzBot • Aide')
      .setDescription('Voici les commandes disponibles selon tes permissions.')
      .setColor(0x5865f2)
      .addFields(
        sections.length > 0
          ? sections
          : [{ name: 'Aucune commande', value: 'Aucune commande disponible pour toi.' }]
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed]
    });
  }
};