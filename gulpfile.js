var gulp = require("gulp"),
	dateformat = require("dateformat"),
	$ = require("gulp-load-plugins")(),
	merge = require("merge-stream"),
	runSequence = require("run-sequence"),

	// package info
	pkg = require("./package.json"),

	banner =　function() {
		return [
			"/* " + pkg.name + " v" + pkg.version + " " + dateformat(new Date(), "yyyy-mm-dd"),
			" * " + pkg.homepage,
			" * License: " + pkg.license,
			" */\n\n"
		].join("\n");
	};

gulp.task("default", ["build"]);

gulp.task("dev", ["watch"]);

gulp.task("up", ["update-npm", "update-bower"]);

gulp.task("build", function(done) {
	runSequence(
		["version", "bower.json", "jshint", "test"],
		["js"],
		done);
});

gulp.task("version", function(done) {
	$.git.revParse({args: "--short HEAD"}, function(err, hash) {
		pkg.version += " (" + hash + ")";
		done();
	});
});

gulp.task("commit", ["build"], function(done) {
	var msg = pkg.version + " compile";
	return gulp.src("dist/**/*")
		.pipe($.git.add())
		.pipe($.git.commit(msg, {args: "-s"}));
});

gulp.task("js", function() {
	return gulp.src(["!**/*.spec.js", "src/**/*.js"])
		.pipe($.rename({ basename: pkg.name }))
		.pipe(gulp.dest("dist"))
		.pipe($.rename({ extname: ".min.js" }))
		.pipe($.uglify())
		.pipe($.header(banner()))
		.pipe(gulp.dest("dist"))
		.pipe($.size());
});

gulp.task("test", function() {
	return gulp.src(["!**/*.tmp.js",
			"lib/angular/angular.js",
			"lib/angular-mocks/angular-mocks.js",
			"src/**/*.js",
			"src/**/*.spec.js"])
		.pipe($.karma({
			configFile: "karma.config.js",
			action: "run"
		}));
});

gulp.task("jshint", function() {
	return gulp.src(["!**/*.tmp.js", "*.js", "src/**/*.js"])
		.pipe($.jshint({
			laxcomma: true
		}))
		.pipe($.jshint.reporter("default"))
		.pipe($.jshint.reporter("fail"))
		.pipe($.jscs());
});

gulp.task("bower.json", function() {
	return gulp.src(["bower.json"])
		.pipe($.replace(/"name": "[^"]*"/, "\"name\": \"" + pkg.name + "\""))
		.pipe($.replace(/"version": "[^"]*"/, "\"version\": \"" + pkg.version + "\""))
		.pipe($.replace(/"description": "[^"]*"/, "\"description\": \"" + pkg.description + "\""))
		.pipe(gulp.dest("./"));
});

gulp.task("update-npm", function() {
	var cmd = "./node_modules/npm-check-updates/bin/npm-check-updates -a";
	$.util.log(cmd);
	return $.shell.task(cmd + " < package.json")();
});

gulp.task("update-bower", function() {
	var bowerjson = require("./bower.json");
	var deps = [];
	var i, cmd;

	for (i in bowerjson.dependencies) {
		if (i[0] == "~") {
			deps.push(i);
		}
	}
	cmd = "bower install --save --force-latest " + deps.join(" ");
	return $.shell.task(cmd)();
});

gulp.task("watch", function() {
	gulp.watch(["src/**", "example/**"], function(info) {
		gulp.src(info.path)
			.pipe($.connect.reload());
	});
	$.connect.server({
		root: "./",
		port: 9000,
		livereload: true
	});
});
