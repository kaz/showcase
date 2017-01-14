"use strict";

const fs = require("fs");
const tmp = require("tmp");
const Promise = require("bluebird");
const readline = require("readline");
const randomstring = require("randomstring");
const child_process = require("child_process");

const Logger = require("./logger");
const settings = require("../settings");

const unlink = Promise.promisify(fs.unlink);
const tmpName = Promise.promisify(tmp.tmpName);
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

const getAddress = async name => {
	const stat = await __exec(`docker inspect ${name}`);
	return JSON.parse(stat)[0].NetworkSettings.Networks[settings.domain].IPAddress;
};

const repo2name = repo => repo.split("/").reverse().join(".");
const randStr = (len = 32) => randomstring.generate(len);

module.exports = {unlink, tmpName, readFile, writeFile, exec, question, getAddress, repo2name, randStr};
