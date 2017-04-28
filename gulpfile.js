"use strict";

const gulp = require("gulp");
const rimraf = require("rimraf");
const closure = require("gulp-closure-compiler-service");

gulp.task("clean", rimraf.bind(null, "client/js/min"));
gulp.task("minify", callback => gulp.src(["client/js/*.js"]).pipe(closure()).pipe(gulp.dest("client/js/min")));

gulp.task("default", ["minify"]);
