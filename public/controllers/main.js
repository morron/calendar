angular.module('MyApp')
  .controller('MainCtrl', ['$scope', 'Calendar', function($scope, Calendar) {
    $scope.calendars = Calendar.query();
  }]);
