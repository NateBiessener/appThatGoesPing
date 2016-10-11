var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//sub-doc for userSchema
var pingSchema = new Schema({
  description: String,
  fireAt: Date, //int, seconds form of Date obj.
  endPoints: {
    email: Boolean,
    sms: Boolean,
    voice: Boolean
  }
});

var userSchema = new Schema({
  userName: String,//nickname
  userId: String,//user_id
  contactInformation: {
    email: String,
    smsPhone: String//TO DO -- ADD voicePhone
  },
  pings: [pingSchema]
});

var userModel = mongoose.model('users', userSchema);
module.exports = userModel;
