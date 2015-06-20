var gulp = require("gulp"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  rename = require("gulp-rename"),
  clean = require("gulp-clean"),
  mustache = require("gulp-mustache-plus"),
  pjson = require("./package.json");

/**
 * Remove temporaries files
 */
gulp.task("cleanTmp", function () {
  return gulp.src("tmp", {read: false}).pipe(clean());
});

/**
 * Build copyright
 */
gulp.task("copyright", function () {
  return gulp.src("src/copyright.js")
    .pipe(mustache(pjson, {extension: ".js"}))
    .pipe(gulp.dest("./tmp"));
});

/**
 * Build non minified version
 */
gulp.task("main", ["copyright"], function() {
  return gulp.src(["tmp/copyright.js", "src/angular-google-maps-native.js"])
    .pipe(concat("angular-google-maps-native.js"))
    .pipe(gulp.dest("dist/"));
});

/**
 * Build minified version
 */
gulp.task("uglify", ["main"], function() {
    return gulp.src("dist/angular-google-maps-native.js")
      .pipe(uglify({preserveComments: "some"}))
      .pipe(rename("angular-google-maps-native.min.js"))
      .pipe(gulp.dest("dist/"));
});

/**
 * Full process to create distributable package
 */
gulp.task("dist", ["uglify"], function () {
  gulp.start("cleanTmp");
});