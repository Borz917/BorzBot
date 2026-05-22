const mongoose = require("mongoose");

const ticketSubjectSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },

  emoji: {
    type: String,
    default: "🎫"
  },

  description: {
    type: String,
    default: "Aucune description"
  },

  logChannelId: {
    type: String,
    default: null
  }
}, {
  _id: false
});

const schema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },

  guildName: String,

  logChannelId: String,
  staffRoleId: String,
  ticketCategoryId: String,

  ticketSubjects: {
    type: [ticketSubjectSchema],
    default: []
  },

  links: {
    site: {
      type: String,
      default: null
    },

    dashboard: {
      type: String,
      default: null
    },

    documentation: {
      type: String,
      default: null
    },

    invite: {
      type: String,
      default: null
    },

    support: {
      type: String,
      default: null
    }
  },

  antiLink: {
    type: Boolean,
    default: false
  },

  antiSpam: {
    type: Boolean,
    default: false
  },

  antiInsulte: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("GuildConfig", schema);