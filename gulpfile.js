"use strict";

const gulp = require("gulp");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");

gulp.task("default", _ =>
	gulp.src(["client/js/*.js"]).
	pipe(babel({presets: ["env"]})).
	pipe(uglify()).
	pipe(gulp.dest("client/js/min"))
);
