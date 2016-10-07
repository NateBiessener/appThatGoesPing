var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
var path = require('path');
//import nodemailer and xoauth2 (used to provide gmail with credentials)
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');

var port = process.env.PORT || 3140;

//import mongoose, connect to db and bring in User model
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ping');
var User = require('./models/userModel');

var credentials = require('./credentials');
// Twilio Credentials
var accountSid = credentials.twilio.accountSid;
var authToken = credentials.twilio.authToken;

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

app.listen(port, function(){
  console.log('server up on', port);
});

app.get('/', function(req,res){
  res.sendFile(path.resolve('public/index.html'));
});

var userRouter = require('./routers/userRouter');
app.use('/users', userRouter);


var checkPings = function(){
  var userQuery = User.find({}, function(err){
    // console.log('in userQuery');
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });
  //check each ping against now
  userQuery.then(function(users){
    // console.log('in then with', users);
    users.forEach(function(user){
      // console.log('in each with', user);
      user.pings.forEach(function(ping){
        console.log('ping ready status:', ping.fireAt < Date.now());
        if (ping.fireAt < Date.now()) {
          if (ping.endPoints.email) {
            var mailOptions = {
              from: 'nathaniel.biessener@gmail.com', // sender address
              to: user.contactInformation.email, // list of receivers
              subject: 'Ping!', // Subject line
              text: ping.description //, // plaintext body
              // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
            };
            console.log('firing ping');
            transporter.sendMail(mailOptions, function(error, info){
              if(error){
                console.log(error);
              }
              else{
                console.log('Message sent: ' + info.response);
              };
            });//end mailSend
          }//end if email
          if (ping.endPoints.sms) {
            client.messages.create({
                to: "+1" + user.contactInformation.smsPhone,
                from: "+15072986921",
                body: ping.description
            }, function(err, message) {
                console.log(message.sid);
            });
          }
          //!!!!!!!!----TO DO: WRAP THIS SO IT ONLY DELETES IF PING FIRED SUCCESSFULLY
          user.pings.id(ping._id).remove();
          user.save(function(err){
            console.log('in save');
            if (err) {
              console.log(err);
            }
            else {
              console.log('ping deleted');
            }
          })//end user.save
        }//end ping fire
      });
    });
    console.log('checked pings');
  });
};

var minute = 60000;
setInterval(checkPings, minute);

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    xoauth2: xoauth2.createXOAuth2Generator({
      user: credentials.xoauth2.user,
      scope: 'https://mail.google.com',
      clientId: credentials.xoauth2.clientId,
      clientSecret: credentials.xoauth2.clientSecret,
      refreshToken: credentials.xoauth2.refreshToken,
    })
  }
});



// nodemailer test route
// app.get('/test', function(req, res){
//   console.log('in /test');
//   handleSayHello(req, res);
// });
// function handleSayHello(req, res) {

// }

app.use(express.static('public'));
