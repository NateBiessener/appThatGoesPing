// console.log('script sourced');

var lock = new Auth0Lock( 'L8O525uQHqNfaKoZqbovFurBHjPNzD8i', 'natebiessener.auth0.com');

//local return URL, for local testing & debugging
var localReturnURL = '?returnTo=http%3A%2F%2Flocalhost:3140/';
//heroku return URL
var herokuReturnURL = '?returnTo=https%3A%2F%2Fglacial-citadel-87639.herokuapp.com/';
// log out url for Auth0 with appropriate return URL
var logOutUrl = 'https://natebiessener.auth0.com/v2/logout' + herokuReturnURL;

var socket = io();

var myApp = angular.module('myApp', []);

myApp.controller('aController', ['$scope', '$http', '$q', function($scope, $http, $q){
  socket.on('pingUpdate', function(){
    // console.log('in socket pingUpdate event');
    setDisplay();
  });

  $scope.pings = [];
  // console.log('ng');

  // console.log({date: new Date().toLocaleString(), jsDate: Date.now()});

  //start authentication functions
  //decide view based on whether a user is logged in
  $scope.onLoad = function(){
    // console.log( 'in init' );
    // check if a user's info is saved in localStorage
    var token = localStorage.getItem('userToken');
    if (token) {
      // if so, save userProfile as $scope.userProfile
      $scope.userProfile = JSON.parse( localStorage.getItem( 'userProfile' ) );
      // console.log( 'loggedIn:', $scope.userProfile );
      if($scope.userProfile.email === "nathaniel.biessener@gmail.com"){
        $scope.masterAccount = true;
      }
      //get users and check for new user
      setDisplay();
      setNow();
      $scope.loggedIn = true;
    }
    else{
      // if no local storage, make sure we are logged out and empty
      emptyLocalStorage();
      $scope.loggedIn = false;
    }
  };
  $scope.onLoad();

  $scope.logIn = function(){
    // console.log( 'in logIn' );
    lock.show();
  };

  lock.on("authenticated", function(authResult) {
    // Use the token in authResult to getProfile() and save it to localStorage
    lock.getProfile(authResult.idToken, function(error, profile) {
      if (error) {
        console.log(error);
        return;
      }

      localStorage.setItem('userToken', authResult.idToken);
      localStorage.setItem('userProfile', JSON.stringify(profile));
      //rerun onload operations, now with user information
      $scope.onLoad();
    });
  });

  $scope.logOut = function(){
    //clear user's token and profile information locally and...
    emptyLocalStorage();
    //...hit auth0's logout url to clear their single sign on cookie
    window.location = logOutUrl;
  };
  //end authentication functions

  //start ping functions
  //hide 'add ping' button and reveal new ping form
  $scope.makeAPing = function(){
    // set new datetime default,
    setNow();
    $scope.newPing = true;
  };

  //add new ping to db, update display with new datetime default
  $scope.addPing = function(){
    var objectToSend = {
      userId: $scope.userProfile.user_id,
      ping: {
        description: $scope.pingIn,
        fireAt: $scope.pingTime,
        endPoints: {
          email: $scope.pingEmail || false,
          sms: $scope.pingSMS || false,
          voice: $scope.pingVoice || false,
          slack: $scope.pingSlack || false
        },
        recurring: $scope.pingRecur
      }
    };
    // console.log('sending', objectToSend);
    $http({
      method: 'POST',
      url: '/users/ping',
      data: objectToSend
    }).then(function(){
      // console.log('saved');
      //clear form, refresh pings display
      $scope.pingIn = '';
      setDisplay();
      //hide form, show Add Ping button
      $scope.newPing = false;
    });
  };

  //set edit form values to the clicked ping's values
  $scope.editPing = function(ping){
    $scope.editPingIn = ping.description;
    $scope.editPingTime = new Date(ping.fireAt);
    $scope.editPingEmail = ping.endPoints.email;
    $scope.editPingSMS = ping.endPoints.sms;
    $scope.editPingVoice = ping.endPoints.voice;
    $scope.editPingSlack = ping.endPoints.slack;
    $scope.editPingRecur = ping.recurring;
    //set for use in $scope.actuallyEditPing
    $scope.pingId = ping._id;
    //change to edit ping form view
    $scope.editPingView = true;
    $scope.pingView = false;
  };//end editPing

  //sends update information to server and updates display
  $scope.actuallyEditPing = function(){
    //build objectToSend from form
    var objectToSend = {
      userId: $scope.userProfile.user_id,
      ping: {
        //_id will have been set by $scope.editPing
        _id: $scope.pingId,
        description: $scope.editPingIn,
        fireAt: $scope.editPingTime,
        endPoints: {
          email: $scope.editPingEmail,
          sms: $scope.editPingSMS,
          voice: $scope.editPingVoice,
          slack: $scope.editPingSlack
        },
        recurring: $scope.editPingRecur
      }
    };
    $http({
      method: 'PUT',
      url: 'users/ping',
      data: objectToSend
    }).then(function(){
      // console.log('ping updated');
      //update pings display
      setDisplay();
      //switch back to pings display
      $scope.editPingView = false;
      $scope.pingView = true;
    });
  };

  //switches from edit ping form view to pings view
  $scope.backToThePings = function(){
    $scope.editPingView = false;
    $scope.pingView = true;
  };

  //delete 'this' ping and update display
  $scope.deletePing = function(id){
    var objectToSend = {
      userId: $scope.userProfile.user_id,
      pingId: id
    };
    // console.log('deletePing:', objectToSend);
    $http({
      method: 'DELETE',
      url: '/users/ping',
      data: objectToSend,
      headers: {"Content-Type": "application/json;charset=utf-8"}
    }).then(function(response){
      setDisplay();
    });
  };

  //switch from contactInformation view to pings view
  $scope.viewPings = function(){
    $scope.pingView = true;
    $scope.userInfoView = false;
  };
  //end ping functions

  //start contactInformation functions
  // switch from pings view to contactInformation view
  $scope.viewContactInfo = function(){
    $scope.contactSaved = '';
    $scope.pingView = false;
    $scope.userInfoView = true;
  };

  //update user's stored contact information
  $scope.updateContact = function(){
    // console.log('updating contact information');
    var objectToSend = {
      userId: $scope.userProfile.user_id,
      contactInformation: {
        email: $scope.emailIn,
        smsPhone: $scope.phoneIn
      }
    };
    // console.log(objectToSend);
    $http({
      method:'PUT',
      url:'users/user',
      data: objectToSend
    }).then(function(data){
      // console.log(data);
      // console.log('update successful');
      $scope.emailIn = objectToSend.contactInformation.email;
      $scope.phoneIn = objectToSend.contactInformation.smsPhone;
      $scope.contactSaved = 'Updated';
    });
  };
  //end contactInformation functions

  //used to order ng-repeat by actual time
  $scope.compareDate = function(item){
    return Date.parse(item.fireAt);
  };

  //populate pings and contactInformation views and decide based on whether user is missing contact info
  function setDisplay(){
    return $http({
      method: 'GET',
      url: '/users/user'
    }).then(function(results){
      // console.log(results.data);
      //create array of userIds to check whether currently logged in user exists in db
      var users = results.data.map(function(index){
        return index.userId;
      });
      // console.log(users);
      //if user_id not in db, create and save
      checkForUser(users)
      .then(function(isNewUser){
        // console.log('in then');
        //recursion to refresh display if the user is new, even though it's lazy :)
        if (isNewUser) {
          setDisplay();
        }
        else {
          // console.log('results:',results);
          //filter all users down to logged in user, then store in variable (single element array, hence [0])
          var user = results.data.filter(function(user){
            return user.userId === $scope.userProfile.user_id;
          })[0];
          // console.log('user:', user);
          //format firing times for pings
          $scope.pings = user.pings.map(function(ping){
            ping.displayTime = new Date(ping.fireAt).toLocaleString([], {month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'});
            return ping;
          });
          //contactInformation form fields pre-populate with existing data
          $scope.emailIn = user.contactInformation.email;
          $scope.phoneIn = user.contactInformation.smsPhone;
          // if all contact fields have a value, show pings view
          if (user.contactInformation.email && user.contactInformation.smsPhone) {
            $scope.pingView = true;
            $scope.userInfoView = false;
            setNow();
          }
          // else show contactInformation view
          else {
            $scope.pingView = false;
            $scope.userInfoView = true;
          }
        }
      });
    });//end GET.then
  }//end setDisplay

  //create default datetime of 15 minutes from now with 0 values for seconds & milliseconds
  function setNow(){
    var now = new Date();
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(now.getMinutes() + 15);
    //set 15 minutes from current time as default reminder time
    $scope.pingTime = now;
  }

  var checkForUser = function(users){
    return $q(function(resolve, reject){
      if (!(users.includes($scope.userProfile.user_id))) {
        var objectToSend = {
          userName: $scope.userProfile.name,//nickname
          userId: $scope.userProfile.user_id,//user_id
          contactInformation: {
            email: $scope.userProfile.email
          }
        };
        $http({
          method: 'POST',
          url: '/users/user',
          data: objectToSend
        }).then(function(){
          // console.log('user saved');
          resolve(true);
        });
      }//end if
      else {
        // console.log('in else');
        resolve(false);
      }
    });//end $q
  };//end checkForUser
}]);//end controller

//does what it says
var emptyLocalStorage = function(){
  localStorage.removeItem( 'userProfile' );
  localStorage.removeItem( 'userToken' );
}; // end emptyLocalStorage
