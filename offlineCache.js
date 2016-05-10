/*
 * Делает из angular-cache или другого кеша, кеш который работает в офлайне и возвращает последнее запрошенное значение
 *
 * в factory передевать объект кеша со следующими методами:
 {object} info() — Returns id, size, and options of cache.
 {{*}} put({string} key, {*} value) — Puts a new key-value pair into the cache and returns it.
 {{*}} get({string} key) — Returns cached value for key or undefined for cache miss.
 {void} remove({string} key) — Removes a key-value pair from the cache.
 {void} removeAll() — Removes all cached values.
 {void} destroy() — Removes references to this cache from $cacheFactory.
 * */

angular
    .module('offlineCache', ['connectionStatus'])
    .factory('offlineCacheFactory', ['$log', 'connectionStatus', '$q', function($log, connectionStatus, $q) {

        function isPromise(value){
            return value && angular.isFunction(value.then);
        }

        function debug(message) {
            $log.debug('offlineCacheFactory >> ' + message)
        }

        function getCache(cache) {

            var baseGet = cache.get;
            var basePut = cache.put;
            /*
             переопределим метод get
             что бы кеш работа только когда нет соединения
             *
             * */

            var isCacheAsync = isPromise(cache.get('key'));

            cache.get = function(key) {
                if(connectionStatus.isOnline()){
                    debug('Online. Skip cache. Key: ' + key);
                    /* ничего не возвращаем, что бы запрос пошёл на сервер */
                    return isCacheAsync ? $q.resolve(undefined) : undefined;
                }
                debug('Offline. Get from cache. Key: ' + key);
                return baseGet(key);
            }

            /*
            * angular помещает промис в кешь перед запросом,
            * если запрос успешен, то промис заменяется результатом запроса,
            * а если нет, то angular удаляет промис
            * такое повидение нам не нужно, т.к. это ведёт к потере ранее сохранённых данных
            * */
            cache.put = function(key, value) {
                if(isPromise(value)){
                    return;
                }
                return basePut(key, value);
            }

            cache.remove = function(key) {
                debug('Angular trying remove cache item. Key: ' + key);
            }

            return cache;
        }



        return function(cache) {
            return getCache(cache);
        };
}]);