const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  userId: String,
  moderatorId: String,

  reason: String,

  active: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Warn", schema);