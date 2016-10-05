console.log('script sourced');

var lock = new Auth0Lock( 'tADNo2G8xWUWbf4EraRWTRKP8mOBv9xB', 'natebiessener.auth0.com');
// log out url, from Auth0
var logOutUrl = 'https://natebiessener.auth0.com/v2/logout';



var myApp = angular.module('myApp', []);

myApp.controller('aController', ['$scope', '$http', function($scope, $http){
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

      $scope.loggedIn = true;
    }
    else{
      // if not, make sure we are logged out and empty
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
  var now = new Date();
  now.setMilliseconds(0);
  now.setSeconds(0);
  now.setMinutes(now.getMinutes() + 15);
  //set 15 minutes from current time as default reminder time
  $scope.pingTime = now;

  $scope.addPing = function(){
    console.log($scope.pingIn);
    console.log($scope.pingTime);
  }

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
