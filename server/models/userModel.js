var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
  description: String,
  fireAt: Date, //int, seconds form of Date obj.
  endPoints: {
    email: Boolean,
    sms: Boolean
  }
});

var userSchema = new Schema({
  userName: String,
  contactInformation: {
    email: String,
    smsPhone: String
  },
  events: [eventSchema]
});

var userModel = mongoose.model('users', userSchema);
module.exports = userModel;
