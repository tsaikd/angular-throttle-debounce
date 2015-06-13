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

gulp.task("up", ["update-npm", "update-bower"]);

gulp.task("build", function(done) {
	runSequence(
		["version", "bower.json", "jshint"],
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

gulp.task("update-npm", function(done) {
	var cmd = "sh -c './node_modules/npm-check-updates/bin/npm-check-updates -u'";
	$.run(cmd).exec().on("end", done);
});

gulp.task("update-bower", function(done) {
	var bowerjson = require("./bower.json");
	var deps = [];
	var i, cmd;

	for (i in bowerjson.dependencies) {
		deps.push(i);
	}
	cmd = "bower install --save --force-latest " + deps.join(" ");
	$.run(cmd).exec().on("end", done);
});
