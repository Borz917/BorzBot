const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  moderatorId: String,
  userId: String,
  action: String,
  reason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ModLog", schema);