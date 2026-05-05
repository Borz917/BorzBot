const { PermissionsBitField } = require('discord.js');
const rolesConfig = require('../config/roles');

let ownerIds = [];

try {
  const ownerConfig = require('../config/owner');

  if (Array.isArray(ownerConfig)) {
    ownerIds = ownerConfig;
  } else if (Array.isArray(ownerConfig.ownerIds)) {
    ownerIds = ownerConfig.ownerIds;
  } else if (Array.isArray(ownerConfig.owners)) {
    ownerIds = ownerConfig.owners;
  } else if (ownerConfig.ownerId) {
    ownerIds = [ownerConfig.ownerId];
  }
} catch (error) {
  console.warn('⚠️ config/owner.js introuvable ou invalide.');
}

ownerIds = ownerIds.map(id => String(id).trim());

function hasPermission(member, commandName) {
  if (!member) return false;

  const userId = String(member.id);

  // ✅ Bypass owner du bot via config/owner.js
  if (ownerIds.includes(userId)) {
    return true;
  }

  // ✅ Bypass propriétaire du serveur Discord
  if (member.guild?.ownerId === userId) {
    return true;
  }

  // ✅ Bypass administrateur
  if (member.permissions?.has(PermissionsBitField.Flags.Administrator)) {
    return true;
  }

  const allowedRoles = rolesConfig[commandName];

  if (!allowedRoles) return false;

  if (allowedRoles === 'ALL') return true;

  if (!Array.isArray(allowedRoles)) return false;

  return member.roles.cache.some(role => allowedRoles.includes(role.name));
}

module.exports = hasPermission;