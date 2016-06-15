
/*
 * Обёртка над $http, позволяет использовать для кеширования indexedDbCache.
 * Использовать $http напрямую нельзя, т.к.
 * indexedDb имееет асинхронное api, то методы indexedDbCache - put и get возвращают promise,
 * */

angular
    .module('offlineCache')
    .factory('httpWrapper', ['$log', '$q', '$cacheFactory', function($log, $q, $cacheFactory) {


        function toHttpPromise(promise, config) {
            promise.success = function(fn) {
                promise.then(function(response) {
                    fn(response.data, response.status, response.headers, config);
                });
                return promise;
            };

            promise.error = function(fn) {
                promise.then(null, function(response) {
                    fn(response.data, response.status, response.headers, config);
                });
                return promise;
            };

            return promise;
        }

        function wrapperCtor($http) {
            var me = function(requestConfig) {
                switch (requestConfig.method) {
                    case 'GET':
                        return me.get(requestConfig.url, requestConfig);
                    case 'POST':
                        return me.post(requestConfig.url, requestConfig.data, requestConfig);
                        break;

                }
                return $http(requestConfig);
            }

            function isPromise(value) {
                return value && angular.isFunction(value.then);
            }

            function debug(message) {
                $log.debug('offlineCacheFactory >> ' + message)
            }

            function requestWithAsyncCache(config, promise) {
                var defer = $q.defer();

                promise
                    .then(function (cacheResult) {
                        if (cacheResult) {
                              if(typeof(cacheResult) === 'string' ) {
                                defer.resolve(JSON.parse(cacheResult));
                            }
                            else{
                                defer.resolve(cacheResult);
                            }
                        }
                        else {
                            var cache = config.cache;
                            config.cache = null;
                            $http(config)
                                .then(function (result) {
                                    var url = config.url;
                                    if(config.params) {
                                        url += '?' + $.param(config.params);
                                    }
                                    //indexedDb "не любит" result по этому JSON.stringify
                                    cache.put(url, JSON.stringify(result))
                                        .then(function(){
                                            defer.resolve(result);
                                        })
                                        .catch(defer.reject)

                                })
                                .catch(defer.reject)
                        }
                    })
                    .catch(defer.reject)

                return defer.promise;
            }

            function requestWithCache(config) {
                var cache = config.cache;
                if (cache === true) {
                    cache = $cacheFactory.get('$http');
                }

                var cacheResult = cache.get(config.url);

                if (isPromise(cacheResult)) {
                    //кешь асинхронный
                    return requestWithAsyncCache(config, cacheResult);
                }

                if (cacheResult) {
                    if(!cacheResult.data){
                        cacheResult = { data: cacheResult };
                    }
                    return $q.resolve(cacheResult);
                }
            }

            me.post = function (url, data, config) {

                config = angular.extend({}, config || {}, {
                    method: 'post',
                    url: url,
                    data: data
                });

                if (config.cache) {
                    var result = requestWithCache(config);
                    if (!result) {
                        /*angular кеширует только get, поэтому кешируем руками*/
                        result = $http(config)
                            .then(function (response) {
                                config.cache.put(response);
                                return response;
                            });
                    }
                    return toHttpPromise(result, config);
                }
                return $http(config);
            };

            me.get = function (url, config) {
                config = angular.extend({}, config || {}, {
                    method: 'get',
                    url: url
                });

                if (config.cache) {
                    var result = requestWithCache(config);
                    if (result) {
                        return toHttpPromise(result, config);
                    }
                    config.cache = null;
                }
                return $http(config);
            }

            return me;
        }

        return function($http){
            return new wrapperCtor($http);
        }

    }]);