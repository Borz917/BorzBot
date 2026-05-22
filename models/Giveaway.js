const mongoose = require("mongoose");
const schema = new mongoose.Schema({ guildId:String, channelId:String, messageId:String, prize:String, winnerCount:Number, endsAt:Date, ended:{type:Boolean,default:false}, participants:{type:[String],default:[]} }, { timestamps:true });
module.exports = mongoose.model("Giveaway", schema);
