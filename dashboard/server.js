require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const { getDashboardData, readJsonFile } = require('./dataReader');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

const allowedRoleNames = [
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
    'DASHBOARD_SESSION_SECRET'
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

passport.use(new DiscordStrategy(
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
));

app.use(express.json());

app.use(session({
  secret: process.env.DASHBOARD_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

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

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
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

app.get('/api/me', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    discriminator: req.user.discriminator,
    avatar: req.user.avatar,
    guildMember: req.user.guildMember
  });
});

app.use('/api', isAuthenticated, hasDashboardAccess);

app.get('/api/all', (req, res) => {
  res.json(getDashboardData());
});

app.get('/api/warns', (req, res) => {
  res.json(readJsonFile('warns.json'));
});

app.get('/api/staffstats', (req, res) => {
  res.json(readJsonFile('staffStats.json'));
});

app.get('/api/invites', (req, res) => {
  res.json(readJsonFile('invites.json'));
});

app.get('/api/giveaways', (req, res) => {
  res.json(readJsonFile('giveaways.json'));
});

app.get('/api/config', (req, res) => {
  res.json(readJsonFile('serverConfigs.json'));
});

app.use(isAuthenticated, hasDashboardAccess, express.static(path.join(__dirname, 'public')));

app.get('/', isAuthenticated, hasDashboardAccess, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard BorzBot sécurisé lancé sur http://localhost:${PORT}`);
});