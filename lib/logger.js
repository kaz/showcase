"use strict";

const meta = [];
const data = [];

const __log = (m, d) => {
	console.log(`[${m}] ${d}`);
	meta.push(m);
	data.push(d);
};

const log = str => __log("LOG", str);
const shell = str => __log("SHELL", str);
const stdout = str => __log("STDOUT", str);
const exception = str => __log("EXCEPTION", str);

const get = _ => [meta, data];

module.exports = {log, shell, stdout, exception, get};
