"use strict";

const fs = require("fs");
const yaml = require("js-yaml");
const Promise = require("bluebird");
const child_process = require("child_process");

const readFile = Promise.promisify(fs.readFile);
const exec = Promise.promisify(child_process.exec);

const staticDeploy = require("./static");

module.exports = async repo => {
	const repoPath = `./data/repositories/${repo}`;
	
	const cloneResult = await exec(`git clone http://localhost/${repo}.git ${repoPath}`).catch(_ => null);
	if(cloneResult === null){
		await exec(`cd ${repoPath} && git fetch && git reset --hard origin/master`);
	}
	
	const rawConfig = await readFile(`${repoPath}/traplus.yml`, "utf-8").catch(_ => null);
	if(!rawConfig){
		return;
	}
	
	const config = yaml.safeLoad(rawConfig);
	if(config.type === "static"){
		await staticDeploy(repo, config);
	}else{
		throw new Error("Unrecognized deploy type");
	}
};
