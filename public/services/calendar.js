angular.module('MyApp')
    .factory('Calendar', ['$resource', function ($resource) {
        return $resource('/api/calendars/:_id', null,
            {'update': {method: 'PUT'}});
    }]);
