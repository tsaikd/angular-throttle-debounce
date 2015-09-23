describe("angular-throttle-debounce unit test", function() {

	var throttle,
		debounce,
		singleton,
		$timeout,
		$browser,
		$log;

	beforeEach(module("angular-throttle-debounce"));

	// reset browser defer for $timeout service
	beforeEach(inject(function($injector) {
		$browser = $injector.get("$browser");
		$log = $injector.get("$log");

		var outstandingRequestCount = 0,
			outstandingRequestCallbacks = [],
			pendingDeferIds = {},
			slice= [].slice;

		function noop() {}

		function sliceArgs(args, startIndex) {
			return slice.call(args, startIndex || 0);
		}

		function completeOutstandingRequest(fn) {
			try {
				fn.apply(null, sliceArgs(arguments, 1));
			} finally {
				outstandingRequestCount--;
				if (outstandingRequestCount === 0) {
					while (outstandingRequestCallbacks.length) {
						try {
							outstandingRequestCallbacks.pop()();
						} catch (e) {
							$log.error(e);
						}
					}
				}
			}
		}

		$browser.defer = function(fn, delay) {
			var timeoutId;
			outstandingRequestCount++;
			timeoutId = setTimeout(function() {
				delete pendingDeferIds[timeoutId];
				completeOutstandingRequest(fn);
			}, delay || 0);
			pendingDeferIds[timeoutId] = true;
			return timeoutId;
		};

		$browser.defer.cancel = function(deferId) {
			if (pendingDeferIds[deferId]) {
				delete pendingDeferIds[deferId];
				clearTimeout(deferId);
				completeOutstandingRequest(noop);
				return true;
			}
			return false;
		};
	}));

	beforeEach(inject(function($injector) {
		$browser = $injector.get("$browser");
		$log = $injector.get("$log");
		$timeout = $injector.get("$timeout");
		throttle = $injector.get("throttle");
		debounce = $injector.get("debounce");
		singleton = $injector.get("singleton");
		expect(throttle).toBeDefined();
		expect(debounce).toBeDefined();
		expect(singleton).toBeDefined();
		expect(typeof throttle).toEqual("function");
		expect(typeof debounce).toEqual("function");
		expect(typeof singleton).toEqual("function");
	}));

	it("test throttle function without trailing", function(done) {
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
	});

	it("test throttle function with trailing", function(done) {
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
	});

	it("test debounce function", function(done) {
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
	});

	it("test singleton function", function(done) {
		var delay = 100;
		var calls = [];
		var fn = singleton(function(callid) {
			return $timeout(function() {
				calls.push(callid);
			}, delay);
		});

		$timeout(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(0);
				fn(1).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(0);
				fn(2).finally(function() {
					expect(calls.length).toEqual(1);
				});
				expect(calls.length).toEqual(0);
			}, delay * 0);
		}, 0)
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(1);
				fn(3).finally(function() {
					expect(calls.length).toEqual(2);
				});
				expect(calls.length).toEqual(1);
			}, delay * 1);
		})
		.then(function() {
			return $timeout(function() {
				expect(calls.length).toEqual(2);
			}, delay * 1);
		})
		.then(function() {
			return $timeout(function() {
				expect(JSON.stringify(calls)).toEqual(JSON.stringify([1, 3]));
			}, delay * 1.5);
		})
		.finally(done);
	});

});
