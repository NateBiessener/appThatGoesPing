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
router.post('/user', function(req, res){
  //create new User from request body
  console.log('in /user post');
  var newUser = new User({
    userName: req.body.userName,
    userId: req.body.userId,
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
  })//end save
});//end /user post

//for use during testing
router.delete('/user', function(req, res){
  User.remove({}, function(err, result){
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


router.get('/ping', function(req, res){

});

//delete ping, expects body of {userId, pingId}
router.delete('/ping', function(req, res){
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

//expects body of {userID, pingDescription, pingTime, endPoints{email, sms}}
router.post('/ping', function(req, res){
  var ping = {
    description: req.body.pingDescription,
    fireAt: req.body.pingTime, //int, seconds form of Date obj.
    endPoints: {
      email: Boolean(req.body.endPoints.email),
      sms: Boolean(req.body.endPoints.sms)
    }
  };
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

    user.pings.push(ping);

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
