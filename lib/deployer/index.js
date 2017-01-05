"use strict";

const path = require("path");
const yaml = require("js-yaml");

const utils = require("../utils");
const Logger = require("../logger");

const deployer = {
	static: require("./static"),
	runtime: require("./runtime"),
};

module.exports = async repo => {
	const repoPath = path.join("./data/repositories", repo);
	
	// clone repo
	Logger.log("Cloning repository ...");
	const cloneResult = await utils.exec(`git clone http://localhost/${repo}.git ${repoPath}`).catch(_ => null);
	if(cloneResult === null){
		// pull repo
		Logger.log("Repository exists.");
		Logger.log("Applying change ...");
		await utils.exec(`cd ${repoPath} && git fetch && git reset --hard origin/master`);
	}
	
	// find config
	Logger.log("Reading config ...");
	const rawConfig = await utils.readFile(`${repoPath}/traplus.yml`, "utf-8").catch(_ => null);
	if(!rawConfig){
		Logger.log("Config not found.");
		return;
	}
	
	// parse config
	const config = yaml.safeLoad(rawConfig);
	
	// [EXPERIMENTAL]
	// modify config for specific runtime
	if(config.image === "runtime/php"){
		config.expose = config.entrypoint = undefined;
		config.http_proxy = 9000;
	}
	
	// run deployer
	if(config.type in deployer){
		await deployer[config.type](repo, config);
	}else{
		throw new Error("Unrecognized deploy type");
	}
};
