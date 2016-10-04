var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
var path = require('path');
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');

var port = process.env.PORT || 3140;

app.listen(port, function(){
  console.log('server up on', port);
});

app.get('/', function(req,res){
  res.sendFile(path.resolve('public/index.html'));
});

app.get('/test', function(req, res){
  console.log('in /test');
  handleSayHello(req, res);
});

app.use(express.static('public'));

function handleSayHello(req, res) {
  var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          xoauth2: xoauth2.createXOAuth2Generator({
            user: ***REMOVED***,
            scope: 'https://mail.google.com',
            clientId: ***REMOVED***,
            clientSecret: ***REMOVED***,
            refreshToken: ***REMOVED***,
          })
      }
  });


  var mailOptions = {
      from: 'nathaniel.biessener@gmail.com', // sender address
      to: 'nathaniel.biessener@gmail.com', // list of receivers
      subject: 'Email Example', // Subject line
      text: 'Hello world!' //, // plaintext body
      // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
  };

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
          res.json({yo: 'error'});
      }else{
          console.log('Message sent: ' + info.response);
          res.json({yo: info.response});
      };
  });
}
