"use strict";

const path = require("path");
const yaml = require("js-yaml");

const utils = require("../utils");
const Logger = require("../logger");
const settings = require("../../settings");

const common = require("./common");
const deployer = {
	static: require("./static"),
	runtime: require("./runtime"),
};

const run = async app => {
	try {
		const repoPath = path.join("./data/repositories", app.document.repo);
		
		// clone repo
		Logger.log("Cloning repository ...");
		const cloneResult = await utils.exec(`git clone ${settings.git}/${app.document.repo}.git ${repoPath}`).catch(_ => null);
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
			// run deployer
			await deployer[config.type](app, config);
		}else{
			throw new Error("Unrecognized deploy type");
		}
	} catch(e) {
		await common.cancel(app);
		Logger.exception(e);
	}
	
	// save application
	app.document.logs.push(Logger.get());
	await app.save();
};

const remove = async app => {
	await common.cancel(app);
	await common.unsetDatabases(app);
	await app.delete();
};

module.exports = {run, remove};
