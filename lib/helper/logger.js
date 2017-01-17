"use strict";

const logs = [];

const __log = (m, d) => {
	const text = `[${m}] ${d}`;
	console.log(text);
	logs.push(text);
};

const log = str => __log("LOG", str);
const shell = str => __log("SHELL", str);
const stdout = str => __log("STDOUT", str);
const exception = str => __log("EXCEPTION", str);

const get = _ => logs.join("\n");

module.exports = {log, shell, stdout, exception, get};
