angular.module('MyApp', ['ngCookies', 'ngResource', 'ngMessages', 'ngRoute', 'mgcrea.ngStrap'])
  .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/', {
          templateUrl: 'views/home.html',
          controller: 'MainCtrl'
        })
        .when('/shows/:id', {
          templateUrl: 'views/detail.html',
          controller: 'DetailCtrl'
        })
        .when('/login', {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .when('/signup', {
          templateUrl: 'views/signup.html',
          controller: 'SignupCtrl'
        })
        .when('/add', {
          templateUrl: 'views/add.html',
          controller: 'AddCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
  }]);

angular.module('MyApp').filter('range', function() {
    return function(input) {
        var lowBound, highBound;
        switch (input.length) {
            case 1:
                lowBound = 0;
                highBound = parseInt(input[0]) - 1;
                break;
            case 2:
                lowBound = parseInt(input[0]);
                highBound = parseInt(input[1]);
                break;
            default:
                return input;
        }
        var result = [];
        for (var i = lowBound; i <= highBound; i++)
            result.push(i);
        return result;
    };
});

angular.module('MyApp').filter('events', function() {
    return function(input) {
        input.by
        return result;
    };
});

require('../services/calendar.js')
require('../controllers/controllers');
