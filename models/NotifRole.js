const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildId: String,
  roleId: String
});

module.exports = mongoose.model("NotifRole", schema);