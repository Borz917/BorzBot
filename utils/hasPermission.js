const rolesConfig = require('../config/roles');
const owners = require('../config/owners');

function hasPermission(member, commandName) {
  // ✅ Bypass total pour les owners
  if (owners.includes(member.id)) return true;

  const allowedRoles = rolesConfig[commandName];

  if (!allowedRoles) return false;
  if (allowedRoles === 'ALL') return true;

  return member.roles.cache.some(role =>
    allowedRoles.includes(role.name)
  );
}

module.exports = hasPermission;