var express = require('express');
var router = express.Router();
//bring in mongoose
var mongoose = require('mongoose');
//bring in Schema
var User = require('../models/userModel');

//routes
router.get('/user', function(req, res){
  console.log('in /user get');
  User.find({userName: req.query.id}, function(err, result){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }
    else{
      console.log('result:', result);
      res.send(result);
    }
  });//end User find
});

router.post('/user', function(req, res){
  //create new User from request body
  console.log('in /user post');
  var newUser = new User({
    userName: req.body.userName,
    contactInformation: req.body.contactInformation
  });//events are added via a separate route
  console.log(newUser);
  newUser.save(function(err){
    console.log('in newUser.save');
    if (err) {
      console.log(err);
      res.sendStatus(500);
    }
    else {
      console.log('saved');
      res.sendStatus(201);
    }
  })
});

module.exports = router;
