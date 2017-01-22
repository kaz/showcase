"use strict";

const utils = require("./utils");
const Parser = require("./parser");
const Logger = require("./logger");
const settings = require("../../settings");

const Deployers = {
	static: require("../deployer/static"),
	runtime: require("../deployer/runtime"),
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
	
	// parse config
	let config;
	try {
		Logger.log("Parsing config ...");
		config = await Parser.parseConfig(app, `${app.repoPath}/${settings.name}.yaml`);
		
		// ignore non-targeted branch
		if(!(app.document.branch in config.branch)){
			throw new Error("Excluded branch");
		}
	} catch(e) {
		Logger.exception(e);
		
		// delete not-configured repository
		Logger.log("Deleting repository ...");
		if(!app.document.updated){
			await utils.rimraf(app.repoPath);
		}
		return;
	}
	
	if(config.type in Deployers){
		// run deployer
		const dep = new Deployers[config.type](app);
		try {
			await dep.run();
			app.addLog("Success", Logger.get());
		} catch(e) {
			await dep.cancel();
			Logger.exception(e);
			app.addLog("Failed", Logger.get());
		}
	}else{
		throw new Error("Unrecognized deploy type");
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
