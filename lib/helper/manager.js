"use strict";

const utils = require("./utils");
const Parser = require("./parser");
const Logger = require("./logger");
const settings = require("../../settings");

const Deployers = {
	static: require("../deployer/static"),
	runtime: require("../deployer/runtime"),
};

const __shutdown = async msg => {
	Logger.exception(msg);
	
	// delete not-configured repository
	if(!app.document.updated){
		Logger.log("Deleting repository ...");
		await utils.rimraf(app.repoPath);
	}
};

const install = async app => {
	// clone repo
	Logger.log("Cloning repository ...");
	const cloneResult = await utils.exec(`git clone --recursive --depth 1 --branch ${app.document.branch} ${app.clonePath} ${app.repoPath}`).catch(_ => null);
	if(cloneResult === null){
		// pull repo
		Logger.log("Repository exists.");
		Logger.log("Applying change ...");
		await utils.exec(`cd ${app.repoPath} && git fetch && git reset --hard origin/${app.document.branch}`);
	}
	
	try {
		// parse config
		Logger.log("Parsing config ...");
		const config = await Parser.parseConfig(app, `${app.repoPath}/${settings.name}.yaml`);
		
		// null means config file not found
		if(config === null){
			return __shutdown("Config file not found");
		}
		
		// ignore non-targeted branch
		if(!(app.document.branch in config.branch)){
			return __shutdown("Excluded branch");
		}
		
		// check deploy type
		if(!(config.type in Deployers)){
			throw new Error("Unrecognized deploy type");
		}
		
		// run deployer
		const dep = new Deployers[config.type](app);
		try {
			await dep.run();
			app.addLog("Success", Logger.get());
		} catch(e) {
			await dep.cancel();
			throw e;
		}
	} catch(e) {
		Logger.exception(e);
		app.addLog("Failed", Logger.get());
	}
	
	// save application
	await app.save();
};

const uninstall = async app => {
	const dep = new Deployers.static(app);
	await dep.cancel();
	await dep.unsetKey();
	await app.delete();
};

const setupNginxSystem = async _ => {
	const gateway = (await utils.getGateway()) + ":" + settings.listen;
	await utils.renderConfig("system", {gateway}, `./data/nginx/_.conf`);
	await utils.exec("docker exec nginx nginx -s reload");
};

module.exports = {install, uninstall, setupNginxSystem};
