const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  userId: String,
  uses: Number
});

module.exports = mongoose.model("Invite", schema);