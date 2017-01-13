"use strict";

const fs = require("fs");
const tmp = require("tmp");
const Promise = require("bluebird");
const child_process = require("child_process");

const Logger = require("./logger");

const unlink = Promise.promisify(fs.unlink);
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const tmpName = Promise.promisify(tmp.tmpName);

const __exec = Promise.promisify(child_process.exec);
const exec = async command => {
	Logger.shell(command);
	const stdout = await __exec(command);
	if(stdout.trim()){
		Logger.stdout(stdout.trim());
	}
};

const getAddress = async name => {
	const stat = await __exec(`docker inspect ${name}`);
	return JSON.parse(stat)[0].NetworkSettings.Networks["tra.plus"].IPAddress;
};

const repo2name = repo => repo.split("/").reverse().join(".");

module.exports = {unlink, readFile, writeFile, tmpName, exec, getAddress, repo2name};
