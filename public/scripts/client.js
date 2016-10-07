// console.log('script sourced');

var lock = new Auth0Lock( 'tADNo2G8xWUWbf4EraRWTRKP8mOBv9xB', 'natebiessener.auth0.com');
// log out url, from Auth0
var logOutUrl = 'https://natebiessener.auth0.com/v2/logout';



var myApp = angular.module('myApp', []);

myApp.controller('aController', ['$scope', '$http', function($scope, $http){
  $scope.pings = [];
  // console.log('ng');

  // console.log({date: new Date().toLocaleString(), jsDate: Date.now()});

  //start authentication functions
  //decide view on whether a user is logged in
  $scope.onLoad = function(){
    // console.log( 'in init' );
    // check if a user's info is saved in localStorage
    if( JSON.parse( localStorage.getItem( 'userProfile' ) ) ){
      // if so, save userProfile as $scope.userProfile
      $scope.userProfile = JSON.parse( localStorage.getItem( 'userProfile' ) );
      console.log( 'loggedIn:', $scope.userProfile );
      //get users and check for new user
      displayPings();
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
    console.log( 'in logIn' );
    lock.show( function( err, profile, token ) {
      if (err) {
        console.error( "auth error: ", err);
      } // end error
      else {

        // save token to localStorage
        localStorage.setItem( 'userToken', token );
        // save user profile to localStorage
        localStorage.setItem( 'userProfile', JSON.stringify( profile ) );
        // reload page because dirtyhaxorz
        location.reload();
      } // end no error
    }); //end lock.show
  };

  $scope.logOut = function(){
    $http({
      method:'GET',
      url: logOutUrl,
    }).then( function( data ){
      // if logged out OK
      if( data.data == 'OK' ){
        // empty localStorage
        emptyLocalStorage();
        $scope.loggedIn = false;
      }
    })
  };
  //end authentication functions

  //start ping functions
  //hide 'add ping' button and reveal new ping form
  $scope.makeAPing = function(){
    $scope.newPing = true;
  };

  //add new ping to db, update display with new datetime default
  $scope.addPing = function(){
    var objectToSend = {
      userId: $scope.userProfile.user_id,
      pingDescription: $scope.pingIn,
      pingTime: $scope.pingTime,
      endPoints: {
        email: $scope.pingEmail,
        sms: $scope.pingSMS
      }
    };
    console.log('sending', objectToSend);
    $http({
      method: 'POST',
      url: '/users/ping',
      data: objectToSend
    }).then(function(){
      console.log('saved');
      //clear form, set new datetime default, refresh pings display
      $scope.pingIn = '';
      setNow();
      displayPings();
      //hide form, show Add Ping button
      $scope.newPing = false;
    });
  }

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
      displayPings();
    });
  }

  //switch from contactInformation view to pings view
  $scope.viewPings = function(){
    $scope.pingView = true;
    $scope.userInfoView = false;
  };
  //end ping functions

  //start contactInformation functions
  // switch from pings view to contactInformation view
  $scope.viewContactInfo = function(){
    $scope.pingView = false;
    $scope.userInfoView = true;
  };

  //update user's stored contact information
  $scope.updateContact = function(){
    console.log('updating contact information');
    var objectToSend = {
      userId: $scope.userProfile.user_id,
      contactInformation: {
        email: $scope.emailIn,
        smsPhone: $scope.phoneIn
      }
    }
    console.log(objectToSend);
    $http({
      method:'PUT',
      url:'users/user',
      data: objectToSend
    }).then(function(){
      console.log('update successful');
      $scope.emailIn = objectToSend.contactInformation.email;
      $scope.phoneIn = objectToSend.contactInformation.smsPhone;
    });
  };
  //end contactInformation functions

  //used to order ng-repeat by actual time
  $scope.compareDate = function(item){
    return Date.parse(item.fireAt);
  }

  //populate pings and contactInformation views and decide based on whether user is missing contact info
  function displayPings(){
    return $http({
      method: 'GET',
      url: '/users/user'
    }).then(function(results){
      console.log(results.data);
      //create array of userIds to check whether currently logged in user exists in db
      var users = results.data.map(function(index){
        return index.userId
      });
      console.log(users);
      //if user_id not in db, create and save
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
          console.log('user saved');
        });
      }//end if

      //filter all users down to logged in user, then store in variable (single element array, hence [0])
      var user = results.data.filter(function(user){
        return user.userId = $scope.userProfile.user_id;
      })[0];
      //format firing times for pings
      $scope.pings = user.pings.map(function(ping){
        ping.fireAt = new Date(ping.fireAt).toLocaleString();
        return ping;
      });
      //contactInformation form fields pre-populate with existing data
      $scope.emailIn = user.contactInformation.email;
      $scope.phoneIn = user.contactInformation.smsPhone;
      //if all contact fields have a value, show pings view
      if (user.contactInformation.email && user.contactInformation.smsPhone) {
        $scope.pingView = true;
        $scope.userInfoView = false;
        setNow();
      }
      //else show contactInformation view
      else {
        $scope.pingView = false;
        $scope.userInfoView = true;
      }
    });//end GET.then
  };//end displayPings

  //create default datetime of 15 minutes from now with 0 values for seconds & milliseconds
  function setNow(){
    var now = new Date();
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(now.getMinutes() + 15);
    //set 15 minutes from current time as default reminder time
    $scope.pingTime = now;
  };

}]);//end controller


//does what it says
var emptyLocalStorage = function(){
  localStorage.removeItem( 'userProfile' );
  localStorage.removeItem( 'userToken' );
}; // end emptyLocalStorage
