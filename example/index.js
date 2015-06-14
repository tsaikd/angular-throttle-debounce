var app = angular.module("myApp", [
	"angular-throttle-debounce"
])

.controller("indexCtrl"
	, [       "$scope", "$timeout", "throttle", "debounce"
	, function($scope,   $timeout,   throttle,   debounce) {

	$scope.throttleResultArray = [];
	$scope.debounceResultArray = [];

	(function(resultArray) {
		var count = 0;
		var fn = throttle(function() {
			count++;
		}, 1000);

		// count === 0
		resultArray.push([count, 0]);

		fn(); // count === 1
		resultArray.push([count, 1]);

		fn(); // count === 1
		resultArray.push([count, 1]);

		fn(); // count === 1
		resultArray.push([count, 1]);

		$timeout(function() {
			// count === 2
			resultArray.push([count, 2]);
			fn(); // count === 3
			resultArray.push([count, 3]);

			$timeout(function() {
				// count === 3
				resultArray.push([count, 3]);
				fn(); // count === 4
				resultArray.push([count, 4]);

				resultArray.push(["end", "end"]);
			}, 1100);
		}, 1100);
	})($scope.throttleResultArray);

	(function(resultArray) {
		var count = 0;
		var fn = debounce(function() {
			count++;
		}, 1000);

		// count === 0
		resultArray.push([count, 0]);

		fn(); // count === 0
		resultArray.push([count, 0]);

		fn(); // count === 0
		resultArray.push([count, 0]);

		fn(); // count === 0
		resultArray.push([count, 0]);

		$timeout(function() {
			// count === 1
			resultArray.push([count, 1]);
			fn(); // count === 1
			resultArray.push([count, 1]);

			$timeout(function() {
				fn(); // count === 2
				resultArray.push([count, 2]);

				resultArray.push(["end", "end"]);
			}, 1100);
		}, 1100);
	})($scope.debounceResultArray);

}])

;
