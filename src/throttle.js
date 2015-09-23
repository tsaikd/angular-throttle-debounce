angular

.module("angular-throttle-debounce", [])

// https://css-tricks.com/the-difference-between-throttling-and-debouncing/
// https://remysharp.com/2010/07/21/throttling-function-calls
.factory("throttle"
	, [       "$q", "$timeout"
	, function($q,   $timeout) {
	return function(callback, threshhold, trailing) {
		threshhold = threshhold || 250;

		var last, deferTimer;

		return function() {
			var now = +new Date(),
				args = arguments,
				context = this;

			$timeout.cancel(deferTimer);
			if (last && now < (last + threshhold)) {
				if (trailing) {
					deferTimer = $timeout(function() {
						now = +new Date();
						last = now;
						return callback.apply(context, args);
					}, threshhold);
				}
				return deferTimer;
			} else {
				var deferred = $q.defer();
				last = now;
				deferred.resolve(callback.apply(context, args));
				deferTimer = deferred.promise;
				return deferTimer;
			}
		};
	};
}])

.factory("debounce"
	, [       "$timeout"
	, function($timeout) {
	return function(callback, delay) {
		delay = delay || 250;

		var deferTimer;

		return function() {
			var args = arguments,
				context = this;
			$timeout.cancel(deferTimer);
			deferTimer = $timeout(function() {
				return callback.apply(context, args);
			}, delay);
			return deferTimer;
		};
	};
}])

.factory("singleton"
	, [       "$q"
	, function($q) {
	return function(callback) {

		function isPromiseLike(promise) {
			return promise &&
				angular.isFunction(promise.then) &&
				angular.isFunction(promise.catch) &&
				angular.isFunction(promise.finally);
		}

		var promise = null;
		return function() {
			var args = arguments;
			var context = this;

			if (promise) {
				return promise;
			}

			if (!angular.isFunction(callback)) {
				return $q.reject(new Error("callback must be function"));
			}

			var result = callback.apply(context, args);

			if (!isPromiseLike(result)) {
				return $q.reject(new Error("callback return must be promise"));
			}

			promise = $q.when(result)
				.finally(function() {
					promise = null;
				});
			return promise;
		};
	};
}])

;
