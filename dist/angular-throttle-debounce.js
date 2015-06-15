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

			if (last && now < (last + threshhold)) {
				$timeout.cancel(deferTimer);
				if (trailing) {
					deferTimer = $timeout(function() {
						last = now;
						callback.apply(context, args);
					}, threshhold);
				} else {
					deferTimer = $timeout(function() {}, threshhold);
				}
				return deferTimer;
			} else {
				last = now;
				callback.apply(context, args);
				return $timeout(function() {}, 0);
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
				callback.apply(context, args);
			}, delay);
			return deferTimer;
		};
	};
}])

;
