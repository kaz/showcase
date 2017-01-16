"use strict";

const path = require("path");
const yaml = require("js-yaml");

const utils = require("../utils");
const Logger = require("../logger");
const settings = require("../../settings");

const appModel = require("../models/applications");
const logModel = require("../models/logs");

const common = require("./common");
const deployer = {
	static: require("./static"),
	runtime: require("./runtime"),
};

const run = async (conn, repo) => {
	try {
		const repoPath = path.join("./data/repositories", repo);
		
		// clone repo
		Logger.log("Cloning repository ...");
		const cloneResult = await utils.exec(`git clone ${settings.git}/${repo}.git ${repoPath}`).catch(_ => null);
		if(cloneResult === null){
			// pull repo
			Logger.log("Repository exists.");
			Logger.log("Applying change ...");
			await utils.exec(`cd ${repoPath} && git fetch && git reset --hard origin/master`);
		}
		
		// find config
		Logger.log("Reading config ...");
		const rawConfig = await utils.readFile(`${repoPath}/${settings.name}.yaml`, "utf-8").catch(_ => null);
		if(!rawConfig){
			throw new Error("Config not found.");
		}
		
		// parse config
		const config = yaml.safeLoad(rawConfig);
		
		// modify config for specific runtime
		if(config.image === "runtime/php"){
			config.expose = config.entrypoint = undefined;
			config.http_proxy = 9000;
		}
		
		if(config.type in deployer){
			// save application entry
			await (await appModel(conn)).remove(repo);
			await (await appModel(conn)).add(repo, config);
			
			// run deployer
			await deployer[config.type](conn, repo, config);
		}else{
			throw new Error("Unrecognized deploy type");
		}
	} catch(e) {
		await common.cancel(repo);
		Logger.exception(e);
	}
	await (await logModel(conn)).add(repo, Logger.get());
};

const remove = async (conn, repo) => {
	await common.cancel(repo);
	await common.unsetDatabases(conn, repo);
	await (await appModel(conn)).remove(repo);
	await (await logModel(conn)).remove(repo);
};

module.exports = {run, remove};
