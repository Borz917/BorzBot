const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  ownerId: String,

  reason: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Ticket", schema);