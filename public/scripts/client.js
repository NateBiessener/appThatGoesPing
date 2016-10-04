console.log('script sourced');

var myApp = angular.module('myApp', []);

myApp.controller('aController', ['$scope', '$http', function($scope, $http){
  console.log('ng');

  $scope.testEmail = function(){
    console.log('in test');
    $http({
      method: 'GET',
      url: '/test'
    });
  };

}]);
