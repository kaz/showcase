"use strict";

const fs = require("fs");
const ejs = require("ejs");
const Promise = require("bluebird");
const readline = require("readline");
const child_process = require("child_process");

const Logger = require("./logger");
const settings = require("../../settings");

const unlink = Promise.promisify(fs.unlink);
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);

const __exec = Promise.promisify(child_process.exec);
const exec = async command => {
	Logger.shell(command);
	const stdout = await __exec(command);
	if(stdout.trim()){
		Logger.stdout(stdout.trim());
	}
};

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
	const config = ejs.render(await readFile(`./resources/${name}.conf`, "utf-8"), params);
	await writeFile(outputFile, config);
};

const getGateway = async _ => {
	const stat = await __exec(`docker network inspect ${settings.domain}`);
	return JSON.parse(stat)[0].IPAM.Config[0].Gateway;
};
const getAddress = async name => {
	const stat = await __exec(`docker inspect ${name}`);
	return JSON.parse(stat)[0].NetworkSettings.Networks[settings.domain].IPAddress;
};

module.exports = {
	unlink, readFile, exec, question,
	request, renderConfig, getGateway, getAddress,
};

