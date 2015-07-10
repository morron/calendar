var moment = require('moment');
require('moment-range');
angular.module('MyApp')
    .controller('MainCtrl', ['$scope', 'Calendar', function ($scope, Calendar) {
        $scope.calendars = Calendar.query();

        $scope.events = [];
        var start = new Date(moment().format('YYYY'), moment().format('M'), '1');
        var end = new Date(moment().format('YYYY'), moment().format('M'), moment().daysInMonth());
        var range = moment.range(start, end);
        range.by('days', function(moment) {
            $scope.events.push(moment.valueOf());
        });

        $scope.save = function(object) {
            object.$update({ _id: object._id }, object);
        }

    }]);
