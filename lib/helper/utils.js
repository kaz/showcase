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

const __exec = Promise.promisify(child_process.exec);
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

const question = query => new Promise((resolve, reject) => {
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
		res.on("end", _ => {
			if(data.length == 0){
				return reject(new Error("No response body"));
			}
			resolve(JSON.parse(Buffer.concat(data)));
		});
	});
});

const renderConfig = async (name, params, outputFile) => {
	await writeFile(outputFile, ejs.render(await readFile(`./resources/${name}.conf`, "utf-8"), params));
};

const getGateway = async _ => {
	const stat = await __exec(`docker network inspect ${settings.domain}`);
	return JSON.parse(stat)[0].IPAM.Config[0].Gateway;
};
const getStatus = async app => {
	const stat = await __exec(`docker inspect ${app.name}`).catch(_ => null);
	if(stat){
		const state = JSON.parse(stat)[0].State;
		if(state){
			return state.Status;
		}
	}
	return "no container";
};
const getLog = async app => {
	return await __exec(`docker logs --tail 512 ${app.name}`).catch(_ => "");
};

module.exports = {
	rimraf, mkdir, unlink, readFile, writeFile,
	exec, question,
	request, renderConfig,
	getGateway, getStatus, getLog,
};

