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
const exec = async (command, use_stdout) => {
	Logger.shell(command);
	const stdout = await __exec(command);
	if(use_stdout){
		return stdout;
	}else if(stdout.trim()){
		Logger.stdout(stdout.trim());
	}
};

module.exports = {unlink, readFile, writeFile, tmpName, exec};
