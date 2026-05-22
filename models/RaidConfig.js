const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  enabled: Boolean
});

module.exports = mongoose.model("RaidConfig", schema);