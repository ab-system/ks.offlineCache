
/*
* decоrator для $http, заменяет $http на httpWrapper
* */

angular
    .module('offlineCache')
    .config([
    '$provide', function ($provide) {
        $provide.decorator('$http', [
            '$delegate',
            'httpWrapper',
            function ($delegate, httpWrapper) {
                return httpWrapper($delegate);
            }]);
    }]);