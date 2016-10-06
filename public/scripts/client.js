console.log('script sourced');

var lock = new Auth0Lock( 'tADNo2G8xWUWbf4EraRWTRKP8mOBv9xB', 'natebiessener.auth0.com');
// log out url, from Auth0
var logOutUrl = 'https://natebiessener.auth0.com/v2/logout';



var myApp = angular.module('myApp', []);

myApp.controller('aController', ['$scope', '$http', function($scope, $http){
  $scope.pings = [];
  console.log('ng');

  console.log({date: new Date().toLocaleString(), jsDate: Date.now()});

  //start authentication functions
  $scope.onLoad = function(){
    console.log( 'in init' );
    // check if a user's info is saved in localStorage
    if( JSON.parse( localStorage.getItem( 'userProfile' ) ) ){
      // if so, save userProfile as $scope.userProfile
      $scope.userProfile = JSON.parse( localStorage.getItem( 'userProfile' ) );
      console.log( 'loggedIn:', $scope.userProfile );
      //get users and check for new user
      $http({
        method: 'GET',
        url: '/users/user'
      }).then(function(results){
        console.log(results.data);
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
        return results;
      }).then(function(results){
        var user = results.data.filter(function(user){
          return user.userId = $scope.userProfile.user_id;
        })[0];
        $scope.pings = user.pings.map(function(ping){
          ping.fireAt = new Date(ping.fireAt).toLocaleString();
          return ping;
        });
        $scope.emailIn = user.contactInformation.email;
        $scope.phoneIn = user.contactInformation.phone;
        if (user.contactInformation.email && user.contactInformation.phone) {
          $scope.pingView = true;
          $scope.userInfoView = false;
        }
        else {
          $scope.pingView = false;
          $scope.userInfoView = true;
        }
      });//end GET.then
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

  //create default datetime of 15 minutes from now with 0 values for seconds & milliseconds
  var setNow = function(){
    var now = new Date();
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(now.getMinutes() + 15);
    //set 15 minutes from current time as default reminder time
    $scope.pingTime = now;
  };
  setNow();

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
      $scope.pingIn = '';
      setNow();
      $scope.pings.push({
        description: objectToSend.pingDescription,
        fireAt: objectToSend.pingTime.toLocaleString()
      });
    });
  }

  $scope.compareDate = function(item){
    return Date.parse(item.fireAt);
  }

  $scope.viewContactInfo = function(){
    $scope.pingView = false;
    $scope.userInfoView = true;
  };

  $scope.viewPings = function(){
    $scope.pingView = true;
    $scope.userInfoView = false;
  };

  //nodemailer test route
  // $scope.testEmail = function(){
  //   console.log('in test');
  //   $http({
  //     method: 'GET',
  //     url: '/test'
  //   });
  // };

}]);



var emptyLocalStorage = function(){
  localStorage.removeItem( 'userProfile' );
  localStorage.removeItem( 'userToken' );
}; // end emptyLocalStorage
