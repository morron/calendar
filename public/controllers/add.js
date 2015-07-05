angular.module('MyApp')
    .controller('AddCtrl', ['$scope', '$alert', 'Calendar', function($scope, $alert, Calendar) {
        $scope.addCalendar = function() {
            Calendar.save({ calendarName: $scope.calendarName },
                function() {
                    $scope.calendarName = '';
                    $scope.addForm.$setPristine();
                    $alert({
                        content: 'Calendar has been added.',
                        placement: 'top-right',
                        type: 'success',
                        duration: 3
                    });
                },
                function(response) {
                    $scope.calendarName = '';
                    $scope.addForm.$setPristine();
                    $alert({
                        content: response.data.message,
                        placement: 'top-right',
                        type: 'danger',
                        duration: 3
                    });
                });
        };
    }]);