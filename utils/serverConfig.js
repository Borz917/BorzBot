const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const configPath = path.join(dataDir, 'serverConfigs.json');

const defaultConfig = {
  staffRoleId: null,

  logs: {
    moderation: null,
    voice: null,
    messages: null,
    boost: null,
    roles: null,
    raid: null,
    support: null
  },

  notifRoles: {
    illegal: null,
    legal: null,
    giveaways: null,
    evenement: null
  },

  ticketCategories: {
    boutique: null,
    support: null,
    recrutement: null,
    illegal: null,
    legal: null,
    unban: null,
    fonda: null,
    plainte_staff: null
  },

  security: {
    antiSpam: {
      enabled: true,
      maxMessages: 5,
      intervalMs: 7000,
      timeoutMs: 10 * 60 * 1000,
      deleteMessages: true
    },

    antiLink: {
      enabled: true,
      deleteMessage: true,
      timeoutMs: 5 * 60 * 1000,
      allowedDomains: [
        'discord.gg',
        'discord.com',
        'youtube.com',
        'youtu.be',
        'tiktok.com'
      ]
    },

    ignoredRoleIds: []
  },

  raid: {
    enabled: true,
    joinsLimit: 5,
    intervalMs: 60 * 1000,
    action: 'alert',
    whitelistRoleIds: [],
    lockIgnoredChannelIds: []
  }
};

function cloneDefaultConfig() {
  return JSON.parse(JSON.stringify(defaultConfig));
}

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '{}', 'utf8');
  }
}

function loadAllConfigs() {
  ensureFile();

  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function saveAllConfigs(data) {
  ensureFile();
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf8');
}

function mergeConfig(config = {}) {
  return {
    ...cloneDefaultConfig(),
    ...config,

    logs: {
      ...defaultConfig.logs,
      ...(config.logs || {})
    },

    notifRoles: {
      ...defaultConfig.notifRoles,
      ...(config.notifRoles || {})
    },

    ticketCategories: {
      ...defaultConfig.ticketCategories,
      ...(config.ticketCategories || {})
    },

    security: {
      ...defaultConfig.security,
      ...(config.security || {}),

      antiSpam: {
        ...defaultConfig.security.antiSpam,
        ...(config.security?.antiSpam || {})
      },

      antiLink: {
        ...defaultConfig.security.antiLink,
        ...(config.security?.antiLink || {}),

        allowedDomains:
          config.security?.antiLink?.allowedDomains ||
          defaultConfig.security.antiLink.allowedDomains
      },

      ignoredRoleIds:
        config.security?.ignoredRoleIds ||
        defaultConfig.security.ignoredRoleIds
    },

    raid: {
      ...defaultConfig.raid,
      ...(config.raid || {}),

      whitelistRoleIds:
        config.raid?.whitelistRoleIds ||
        defaultConfig.raid.whitelistRoleIds,

      lockIgnoredChannelIds:
        config.raid?.lockIgnoredChannelIds ||
        defaultConfig.raid.lockIgnoredChannelIds
    }
  };
}

function getServerConfig(guildId) {
  const data = loadAllConfigs();

  if (!data[guildId]) {
    data[guildId] = cloneDefaultConfig();
    saveAllConfigs(data);
  }

  return mergeConfig(data[guildId]);
}

function updateServerConfig(guildId, updater) {
  const data = loadAllConfigs();

  if (!data[guildId]) {
    data[guildId] = cloneDefaultConfig();
  }

  const current = mergeConfig(data[guildId]);
  const updated = updater(current);

  data[guildId] = updated;
  saveAllConfigs(data);

  return updated;
}

// =========================
// CONFIG GÉNÉRALE
// =========================
function setStaffRole(guildId, roleId) {
  return updateServerConfig(guildId, config => {
    config.staffRoleId = roleId;
    return config;
  });
}

function setLogChannel(guildId, type, channelId) {
  return updateServerConfig(guildId, config => {
    config.logs[type] = channelId;
    return config;
  });
}

function setNotifRole(guildId, type, roleId) {
  return updateServerConfig(guildId, config => {
    config.notifRoles[type] = roleId;
    return config;
  });
}

function setTicketCategory(guildId, type, categoryId) {
  return updateServerConfig(guildId, config => {
    config.ticketCategories[type] = categoryId;
    return config;
  });
}

// =========================
// SÉCURITÉ
// =========================
function setSecuritySpam(guildId, options) {
  return updateServerConfig(guildId, config => {
    config.security.antiSpam = {
      ...config.security.antiSpam,
      ...options
    };

    return config;
  });
}

function setSecurityLink(guildId, options) {
  return updateServerConfig(guildId, config => {
    config.security.antiLink = {
      ...config.security.antiLink,
      ...options
    };

    return config;
  });
}

function addIgnoredSecurityRole(guildId, roleId) {
  return updateServerConfig(guildId, config => {
    if (!config.security.ignoredRoleIds.includes(roleId)) {
      config.security.ignoredRoleIds.push(roleId);
    }

    return config;
  });
}

function removeIgnoredSecurityRole(guildId, roleId) {
  return updateServerConfig(guildId, config => {
    config.security.ignoredRoleIds = config.security.ignoredRoleIds.filter(
      id => id !== roleId
    );

    return config;
  });
}

function addAllowedDomain(guildId, domain) {
  return updateServerConfig(guildId, config => {
    const cleanDomain = domain.toLowerCase().trim();

    if (!config.security.antiLink.allowedDomains.includes(cleanDomain)) {
      config.security.antiLink.allowedDomains.push(cleanDomain);
    }

    return config;
  });
}

function removeAllowedDomain(guildId, domain) {
  return updateServerConfig(guildId, config => {
    const cleanDomain = domain.toLowerCase().trim();

    config.security.antiLink.allowedDomains =
      config.security.antiLink.allowedDomains.filter(d => d !== cleanDomain);

    return config;
  });
}

// =========================
// ANTI-RAID
// =========================
function setRaidConfig(guildId, options) {
  return updateServerConfig(guildId, config => {
    config.raid = {
      ...config.raid,
      ...options
    };

    return config;
  });
}

function addRaidWhitelistRole(guildId, roleId) {
  return updateServerConfig(guildId, config => {
    if (!config.raid.whitelistRoleIds.includes(roleId)) {
      config.raid.whitelistRoleIds.push(roleId);
    }

    return config;
  });
}

function removeRaidWhitelistRole(guildId, roleId) {
  return updateServerConfig(guildId, config => {
    config.raid.whitelistRoleIds = config.raid.whitelistRoleIds.filter(
      id => id !== roleId
    );

    return config;
  });
}

function addRaidIgnoredChannel(guildId, channelId) {
  return updateServerConfig(guildId, config => {
    if (!config.raid.lockIgnoredChannelIds.includes(channelId)) {
      config.raid.lockIgnoredChannelIds.push(channelId);
    }

    return config;
  });
}

function removeRaidIgnoredChannel(guildId, channelId) {
  return updateServerConfig(guildId, config => {
    config.raid.lockIgnoredChannelIds = config.raid.lockIgnoredChannelIds.filter(
      id => id !== channelId
    );

    return config;
  });
}

// =========================
// RESET
// =========================
function resetServerConfig(guildId) {
  const data = loadAllConfigs();

  if (data[guildId]) {
    delete data[guildId];
    saveAllConfigs(data);
  }
}

module.exports = {
  getServerConfig,

  setStaffRole,
  setLogChannel,
  setNotifRole,
  setTicketCategory,

  setSecuritySpam,
  setSecurityLink,
  addIgnoredSecurityRole,
  removeIgnoredSecurityRole,
  addAllowedDomain,
  removeAllowedDomain,

  setRaidConfig,
  addRaidWhitelistRole,
  removeRaidWhitelistRole,
  addRaidIgnoredChannel,
  removeRaidIgnoredChannel,

  resetServerConfig
};