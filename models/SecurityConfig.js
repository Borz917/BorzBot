const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,

  antiSpam: Boolean,
  antiLink: Boolean,
  antiInsulte: Boolean
});

module.exports = mongoose.model("SecurityConfig", schema);