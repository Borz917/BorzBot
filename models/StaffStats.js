const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  userId: String,

  warns: {
    type: Number,
    default: 0
  },

  bans: {
    type: Number,
    default: 0
  },

  kicks: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("StaffStats", schema);