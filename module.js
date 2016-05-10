/**
 * Created by eolt on 08.10.2015.
 */

    angular.module('components', ['connectionStatus', 'offlineCache', 'localStorageCache', 'indexedDbCache'])
        .controller('mainCtrl', [ '$scope', 'offlineCacheFactory', '$cacheFactory', '$http', '$log', 'connectionStatus',
            'localStorageCacheFactory', 'indexedDbCacheFactory', 'httpWrapper',
            function($scope, offlineCacheFactory, $cacheFactory, $http, $log, connectionStatus,
                     localStorageCacheFactory, indexedDbCacheFactory, httpWrapper) {

                var getUrl = 'http://localhost:8080/test-get';
                var postUrl = 'http://localhost:8080/test-post';

            var httpCache = localStorageCacheFactory('httpCache');

                var offlineCache = offlineCacheFactory(localStorageCacheFactory('httpCache'));
                var asyncOfflineCache = offlineCacheFactory(indexedDbCacheFactory('httpCache'));

                var $httpW = httpWrapper($http);

            $scope.status = connectionStatus.isOnline();


            function onlineHandler() {
                $scope.status = true;
            }

            function offlineHandler() {
                $scope.status = false;
            }

            connectionStatus.$on('online', onlineHandler);
            connectionStatus.$on('offline', offlineHandler);

            $scope.$on('$destroy', function() {
                connectionStatus.$off('online', onlineHandler);
                connectionStatus.$off('offline', offlineHandler);
            });

            $scope.send  = function() {
                $http.get(getUrl, { cache: offlineCache })
                    .then(function(response) {
                        $scope.responseGet = response.data;
                    })
                    .catch($log.error);

                $http.post(postUrl, null, { cache: offlineCache })
                    .then(function(response) {
                        if(response) {
                            $scope.responsePost = response.data;
                        }
                    })
                    .catch($log.error);

                $httpW.get(getUrl, { cache: asyncOfflineCache })
                    .then(function(response) {
                        $scope.responseGetAsync = response.data;
                    })
                    .catch($log.error);


                $httpW.post(postUrl, null, { cache: asyncOfflineCache })
                    .then(function(response) {
                        $scope.responsePostAsync = response.data;
                    })
                    .catch($log.error);


            }

                connectionStatus.start(getUrl);

        }]);