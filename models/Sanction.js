const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  userId: String,

  warns: {
    type: Number,
    default: 0
  },

  mutes: {
    type: Number,
    default: 0
  },

  bans: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Sanctions", schema);