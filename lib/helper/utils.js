"use strict";

const fs = require("fs");
const ejs = require("ejs");
const Promise = require("bluebird");
const readline = require("readline");
const child_process = require("child_process");

const Logger = require("./logger");
const settings = require("../../settings");

const rimraf = Promise.promisify(require("rimraf"));
const mkdir = Promise.promisify(fs.mkdir);
const unlink = Promise.promisify(fs.unlink);
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);

const exec = (command, showError = false) => new Promise((resolve, reject) => {
	Logger.shell(command);
	child_process.exec(command, (error, stdout, stderr) => {
		if(stdout && stdout.trim()){
			Logger.stdout(stdout.trim());
		}
		if(showError && stderr && stderr.trim()){
			Logger.stderr(stderr.trim());
		}
		(error ? reject : resolve)(error);
	});
});

const question = query => new Promise(resolve => {
	const ifce = readline.createInterface(process.stdin, process.stdout, null);
	ifce.question(query, answer => {
		ifce.close();
		resolve(answer);
	});
});

const request = path => new Promise((resolve, reject) => {
	const http = require(settings.api.protocol.substr(0, settings.api.protocol.length - 1));
	settings.api.path = path;
	http.get(settings.api, res => {
		if(res.statusCode !== 200){
			return reject(new Error("Invalid status code " + res.statusCode));
		}
		const data = [];
		res.on("data", chunk => data.push(chunk));
		res.on("end", () => {
			if(data.length == 0){
				return reject(new Error("No response body"));
			}
			resolve(JSON.parse(Buffer.concat(data)));
		});
	});
});

const renderToFile = async (name, params, outputFile) => {
	await writeFile(outputFile, await renderToString(name, params));
};
const renderToString = async (name, params) => {
	return ejs.render(await readFile(`./resources/nginx-${name}.ejs`, "utf-8"), params);
};

module.exports = {
	rimraf, mkdir, unlink, readFile, writeFile,
	exec, question, request,
	renderToFile, renderToString,
};
