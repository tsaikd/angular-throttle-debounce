var app = angular.module("myApp", [
	"angular-throttle-debounce"
])

.controller("indexCtrl"
	, [       "$scope", "$timeout", "throttle", "debounce"
	, function($scope,   $timeout,   throttle,   debounce) {

	$scope.throttleNoTrailingResultArray = [];
	$scope.throttleTrailingResultArray = [];
	$scope.debounceResultArray = [];

	function genExpect(resultArray) {
		var expect = function(value) {
			this.resultArray = resultArray;
			this.value = value;
			return this;
		};
		expect.toEqual = function(expectValue) {
			this.resultArray.push([this.value, expectValue]);
			return this;
		};
		return expect.bind(expect);
	}

	function genDone(resultArray) {
		var done = function() {
			resultArray.push(["end", "end"]);
			return this;
		};
		return done.bind(done);
	}

	(function(expect, done) {
		var delay = 100;
		var calls = [];
		var fn = throttle(function(callid) {
			calls.push(callid);
		}, delay);

		$timeout(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(0);
				fn(1).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(1);
				fn(2).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(1);
				fn(3).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(1);
			}, delay * 0);
		}, 0)
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(1);
				fn(4).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(1);
				fn(5).finally(function(a, b) {
					expect(calls.length >= 1).toBeTruthy();
				});
				expect(calls.length).toEqual(1);
			}, delay * 0.5);
		})
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(1);
				fn(6).finally(function() {
					expect(calls.length >= 2).toBeTruthy();
				});
				expect(calls.length).toEqual(2);
				fn(7).finally(function() {
					expect(calls.length).toEqual(2);
				});
				expect(calls.length).toEqual(2);
			}, delay * 1);
		})
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(2);
			}, delay * 1);
		})
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(2);
			}, delay * 1);
		})
		.then(function() {
			return $timeout(function() {
				expect(JSON.stringify(calls)).toEqual(JSON.stringify([1, 6]));
			}, delay * 1);
		})
		.finally(done);
	})(genExpect($scope.throttleNoTrailingResultArray), genDone($scope.throttleNoTrailingResultArray));

	(function(expect, done) {
		var delay = 100;
		var calls = [];
		var fn = throttle(function(callid) {
			calls.push(callid);
		}, delay, true);

		$timeout(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(0);
				fn(1).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(1);
				fn(2).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(1);
				fn(3).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(1);
			}, delay * 0);
		}, 0)
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(1);
				fn(4).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(1);
				fn(5).finally(function(a, b) {
					expect(calls.length).toEqual(2);
				});
				expect(calls.length).toEqual(1);
			}, delay * 0.5);
		})
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(1);
				fn(6).finally(function() {
					expect(calls.length).toEqual(2);
				});
				expect(calls.length).toEqual(2);
				fn(7).finally(function() {
					expect(calls.length).toEqual(3);
				});
				expect(calls.length).toEqual(2);
			}, delay * 0.5);
		})
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(3);
			}, delay * 1.5);
		})
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(3);
			}, delay * 1);
		})
		.then(function() {
			return $timeout(function() {
				expect(JSON.stringify(calls)).toEqual(JSON.stringify([1, 6, 7]));
			}, delay * 1);
		})
		.finally(done);
	})(genExpect($scope.throttleTrailingResultArray), genDone($scope.throttleTrailingResultArray));

	(function(expect, done) {
		var delay = 100;
		var calls = [];
		var fn = debounce(function(callid) {
			calls.push(callid);
		}, delay);

		$timeout(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(0);
				fn(1).finally(function() {
					expect(calls.length).toEqual(0);
				});
				expect(calls.length).toEqual(0);
				fn(2).finally(function() {
					expect(calls.length).toEqual(0);
				});
				expect(calls.length).toEqual(0);
			}, delay * 0);
		}, 0)
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(0);
				fn(3).finally(function() {
					expect(calls.length).toEqual(0);
				});
				expect(calls.length).toEqual(0);
				fn(4).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(0);
			}, delay * 0.5);
		})
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(1);
				fn(5).finally(function() {
					expect(calls.length).toEqual(2);
				});
				expect(calls.length).toEqual(1);
			}, delay * 1.5);
		})
		.then(function() {
			return $timeout(function() {
				expect(JSON.stringify(calls)).toEqual(JSON.stringify([4, 5]));
			}, delay * 1.5);
		})
		.finally(done);
	})(genExpect($scope.debounceResultArray), genDone($scope.debounceResultArray));

}])

;
