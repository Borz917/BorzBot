const GuildConfig = require("../models/GuildConfig");

async function isStaff(member) {
  if (!member) return false;

  if (member.permissions.has("Administrator")) {
    return true;
  }

  const config = await GuildConfig.findOne({
    guildId: member.guild.id
  });

  if (!config) return false;

  return member.roles.cache.has(config.staffRoleId);
}

module.exports = {
  isStaff
};