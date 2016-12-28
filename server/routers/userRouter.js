var express = require('express');
var router = express.Router();
//bring in mongoose
var mongoose = require('mongoose');
//bring in Schema
var User = require('../models/userModel');

//begin routes

//begin /user routes
//get all users
router.get('/user', function(req, res){
  console.log('in /user get');
  User.find({}, function(err, results){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }
    else{
      // console.log('results:', results);
      res.send(results);
    }
  });//end User find
});//end /user get

//expects body of {userName, userId, contactInformation}
//pings are added via a separate route
router.post('/user', function(req, res){
  //create new User from request body
  console.log('in /user post');
  var userData = {};
  for (var prop in req.body) {
    if (req.body.hasOwnProperty(prop)) {
      userData[prop] = req.body[prop];
    }
  }
  var newUser = new User(userData);
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
  })//end save
});//end /user post

//expects {userId, contactInformation}
router.put('/user', function(req, res){
  var query = User.find({userId: req.body.userId}, function(err){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }
  });
  query.then(function(user){
    //user is an array with a single index at this point, unwrapping
    user = user[0];
    user.contactInformation = req.body.contactInformation;
    user.save(function(err){
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        else {
          res.sendStatus(200);
        }
    })
  });//end query.then
});

//for use during testing
router.delete('/user', function(req, res){
  User.remove({userId: req.query.id}, function(err, result){
    if (err) {
      console.log(err);
    }
    else {
      res.send(result);
    }
  });
});//end /user delete

//end /user routes
//begin /ping routes
//expects {user_id, ping: {(ping)_id, description, fireAt, endPoints{}, recurring}}
router.put('/ping', function(req, res){
  var query = User.find({userId: req.body.userId}, function(err){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }
  });
  query.then(function(user){
    //user is an array with a single index at this point, unwrapping
    user = user[0];
    //for each property, update ping if property was sent
    for (var prop in req.body.ping) {
      if (req.body.ping.hasOwnProperty(prop)) {
        user.pings.id(req.body.ping._id)[prop] = req.body.ping[prop];
      }
    }

    user.save(function(err){
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        else {
          res.sendStatus(200);
        }
    });
  });//end query.then
});

//delete ping, expects body of {userId, pingId}
router.delete('/ping', function(req, res){
  console.log('in ping delete:', req.body);
  var query = User.find({userId: req.body.userId}, function(err){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }
  });
  query.then(function(users){
    //user is an array with a single index at this point, unwrapping
    user = users[0];
    // console.log('in then with', user);

    user.pings.id(req.body.pingId).remove();

    user.save(function(err){
      console.log('in save');
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      else {
        console.log('ping deleted');
        res.sendStatus(200);
      }
    })//end user.save
  })//end query.then
});//end /ping post

//expects body of {userID,
//                 ping: {pingDescription, pingTime, endPoints{email, sms, voice, slack}, recurring}}
router.post('/ping', function(req, res){
  var query = User.find({userId: req.body.userId}, function(err){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }
  });
  query.then(function(user){
    //user is an array with a single index at this point, unwrapping
    user = user[0];
    // console.log('in then with', user);

    user.pings.push(req.body.ping);

    user.save(function(err){
      console.log('in save');
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      else {
        console.log('ping saved');
        res.sendStatus(201);
      }
    })//end user.save
  })//end query.then
});//end /ping post

//end /ping routes

//end routes

module.exports = router;
