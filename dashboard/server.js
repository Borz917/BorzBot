require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const { getDashboardData, readJsonFile, writeJsonFile } = require('./dataReader');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

const allowedRoleNames = [
  'Équipe STAFF',
  'Main Team',
  'Gérant Staff',
  'Gérant Global',
  'Responsable Staff'
];

function requireEnv() {
  const required = [
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DISCORD_CALLBACK_URL',
    'DASHBOARD_GUILD_ID',
    'DASHBOARD_SESSION_SECRET',
    'TOKEN'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.log(`❌ Variables .env manquantes : ${missing.join(', ')}`);
    process.exit(1);
  }
}

requireEnv();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ['identify', 'guilds', 'guilds.members.read']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const guildId = process.env.DASHBOARD_GUILD_ID;

        const memberResponse = await fetch(
          `https://discord.com/api/users/@me/guilds/${guildId}/member`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        if (!memberResponse.ok) {
          return done(null, false, {
            message: 'Tu n’es pas dans le serveur autorisé.'
          });
        }

        const memberData = await memberResponse.json();

        profile.guildMember = memberData;
        profile.accessToken = accessToken;

        return done(null, profile);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

app.use(express.json());

app.use(
  session({
    secret: process.env.DASHBOARD_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public'), { index: false }));

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/login');
}

async function hasDashboardAccess(req, res, next) {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }

    const guildId = process.env.DASHBOARD_GUILD_ID;
    const serverConfigs = readJsonFile('serverConfigs.json');

    const guildConfig = serverConfigs[guildId] || {};
    const configuredStaffRoleId = guildConfig.staffRoleId || null;

    const memberRoles = req.user.guildMember?.roles || [];

    if (configuredStaffRoleId && memberRoles.includes(configuredStaffRoleId)) {
      return next();
    }

    const guildRolesResponse = await fetch(
      `https://discord.com/api/guilds/${guildId}/roles`,
      {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`
        }
      }
    );

    if (!guildRolesResponse.ok) {
      return res.status(403).send('Accès refusé : impossible de vérifier les rôles.');
    }

    const roles = await guildRolesResponse.json();

    const allowedRoleIds = roles
      .filter(role => allowedRoleNames.includes(role.name))
      .map(role => role.id);

    const hasRole = memberRoles.some(roleId => allowedRoleIds.includes(roleId));

    if (!hasRole) {
      return res.status(403).send('Accès refusé : tu n’as pas le rôle staff requis.');
    }

    return next();
  } catch (error) {
    console.error('Erreur vérification accès dashboard :', error);
    return res.status(500).send('Erreur serveur.');
  }
}

// =========================
// AUTH
// =========================
app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get(
  '/auth/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: '/login?error=access_denied'
  }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

// =========================
// API PROTÉGÉE
// =========================
app.get('/api/me', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    discriminator: req.user.discriminator,
    avatar: req.user.avatar,
    guildMember: req.user.guildMember
  });
});

app.get('/api/all', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.json(getDashboardData());
});

app.get('/api/warns', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.json(readJsonFile('warns.json'));
});

app.get('/api/staffstats', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.json(readJsonFile('staffStats.json'));
});

app.get('/api/invites', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.json(readJsonFile('invites.json'));
});

app.get('/api/giveaways', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.json(readJsonFile('giveaways.json'));
});

app.get('/api/config', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.json(readJsonFile('serverConfigs.json'));
});

app.get('/api/logs', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.json(readJsonFile('dashboardLogs.json'));
});

app.post('/api/logs/clear', isAuthenticated, hasDashboardAccess, (req, res) => {
  const { guildId } = req.body;

  const logs = readJsonFile('dashboardLogs.json');

  if (guildId) {
    delete logs[guildId];
  } else {
    for (const key of Object.keys(logs)) {
      delete logs[key];
    }
  }

  writeJsonFile('dashboardLogs.json', logs);

  return res.json({
    success: true,
    message: guildId
      ? `Logs supprimés pour le serveur ${guildId}.`
      : 'Tous les logs dashboard ont été supprimés.'
  });
});

// =========================
// API ACTIONS DASHBOARD V3
// =========================
app.post('/api/staffstats/reset', isAuthenticated, hasDashboardAccess, (req, res) => {
  const { guildId, userId } = req.body;

  if (!guildId) {
    return res.status(400).json({
      success: false,
      message: 'guildId manquant.'
    });
  }

  const staffStats = readJsonFile('staffStats.json');

  if (!staffStats[guildId]) {
    return res.json({
      success: true,
      message: 'Aucune stat à reset.'
    });
  }

  if (userId) {
    delete staffStats[guildId][userId];
  } else {
    delete staffStats[guildId];
  }

  writeJsonFile('staffStats.json', staffStats);

  return res.json({
    success: true,
    message: userId
      ? `Stats reset pour ${userId}.`
      : `Toutes les stats du serveur ${guildId} ont été reset.`
  });
});

app.post('/api/giveaways/delete', isAuthenticated, hasDashboardAccess, (req, res) => {
  const { guildId, giveawayId } = req.body;

  if (!guildId || !giveawayId) {
    return res.status(400).json({
      success: false,
      message: 'guildId ou giveawayId manquant.'
    });
  }

  const giveaways = readJsonFile('giveaways.json');

  if (!Array.isArray(giveaways[guildId])) {
    return res.status(404).json({
      success: false,
      message: 'Aucun giveaway trouvé pour ce serveur.'
    });
  }

  const before = giveaways[guildId].length;

  giveaways[guildId] = giveaways[guildId].filter(g => g.id !== giveawayId);

  if (giveaways[guildId].length === before) {
    return res.status(404).json({
      success: false,
      message: 'Giveaway introuvable.'
    });
  }

  writeJsonFile('giveaways.json', giveaways);

  return res.json({
    success: true,
    message: `Giveaway ${giveawayId} supprimé.`
  });
});

app.get('/api/security', isAuthenticated, hasDashboardAccess, (req, res) => {
  const configs = readJsonFile('serverConfigs.json');

  const securityData = {};

  for (const guildId of Object.keys(configs)) {
    securityData[guildId] = {
      security: configs[guildId].security || null,
      raid: configs[guildId].raid || null
    };
  }

  return res.json(securityData);
});

app.post('/api/logs/delete', isAuthenticated, hasDashboardAccess, (req, res) => {
  const { guildId, logId } = req.body;

  if (!guildId || !logId) {
    return res.status(400).json({
      success: false,
      message: 'guildId ou logId manquant.'
    });
  }

  const logs = readJsonFile('dashboardLogs.json');

  if (!Array.isArray(logs[guildId])) {
    return res.status(404).json({
      success: false,
      message: 'Aucun log trouvé pour ce serveur.'
    });
  }

  const before = logs[guildId].length;

  logs[guildId] = logs[guildId].filter(log => log.id !== logId);

  if (logs[guildId].length === before) {
    return res.status(404).json({
      success: false,
      message: 'Log introuvable.'
    });
  }

  writeJsonFile('dashboardLogs.json', logs);

  return res.json({
    success: true,
    message: 'Log supprimé.'
  });
});

app.get('/api/logs/export/json', isAuthenticated, hasDashboardAccess, (req, res) => {
  const logs = readJsonFile('dashboardLogs.json');

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="borzbot-logs.json"');

  return res.send(JSON.stringify(logs, null, 2));
});

app.get('/api/logs/export/txt', isAuthenticated, hasDashboardAccess, (req, res) => {
  const logs = readJsonFile('dashboardLogs.json');

  let text = 'BORZBOT DASHBOARD LOGS\n';
  text += `Export généré le ${new Date().toLocaleString('fr-FR')}\n`;
  text += '==================================================\n\n';

  for (const guildId of Object.keys(logs)) {
    const guildLogs = Array.isArray(logs[guildId]) ? logs[guildId] : [];

    text += `SERVEUR : ${guildId}\n`;
    text += '--------------------------------------------------\n';

    for (const log of guildLogs) {
      text += `Date : ${log.createdAt || 'Date inconnue'}\n`;
      text += `Type : ${log.type || 'other'}\n`;
      text += `Titre : ${log.title || 'Log'}\n`;
      text += `Description :\n${log.description || 'Aucune description.'}\n`;
      text += '--------------------------------------------------\n';
    }

    text += '\n';
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="borzbot-logs.txt"');

  return res.send(text);
});

// =========================
// PAGE PROTÉGÉE
// =========================
app.get('/', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard BorzBot sécurisé lancé sur http://localhost:${PORT}`);
});