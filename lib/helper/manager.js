"use strict";

const shellescape = require("shell-escape");

const utils = require("./utils");
const Parser = require("./parser");
const Logger = require("./logger");
const settings = require("../../settings");

const Deployers = {
	static: require("../deployer/static"),
	runtime: require("../deployer/runtime"),
};

const __shutdown = async (app, msg) => {
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
	const cloneResult = await utils.exec(`git clone --recursive --depth 1 --branch ${shellescape([app.document.branch])} ${shellescape([app.clonePath])} ${shellescape([app.repoPath])}`).catch(_ => null);
	if(cloneResult === null){
		// pull repo
		Logger.log("Repository exists.");
		Logger.log("Applying change ...");
		await utils.exec(`cd ${app.repoPath} && git fetch && git reset --hard ${shellescape([`origin/${app.document.branch}`])} && git submodule update --recursive`);
	}
	
	try {
		// parse config
		Logger.log("Parsing config ...");
		const config = await Parser.parseConfig(app, `${app.repoPath}/${settings.name}.yaml`);
		
		// null means config file not found
		if(config === null){
			return __shutdown(app, "Config file not found");
		}
		
		// ignore non-targeted branch
		if(!(app.document.branch in config.branch)){
			return __shutdown(app, "Excluded branch");
		}
		
		// check deploy type
		const fcgi = /^fcgi\./.test(config.type);
		if(!fcgi && !(config.type in Deployers)){
			throw new Error("Unrecognized deploy type");
		}
		
		// run deployer
		const dep = new Deployers[fcgi ? "runtime" : config.type](app);
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
	await utils.rimraf(app.repoPath);
};

const setupNginx = async _ => {
	await utils.renderConfig("system", {
		host: settings.host,
		listen: settings.listen,
		gateway: await utils.getGateway(),
	}, `./data/nginx/conf.d/!.conf`);
	await utils.exec("cp -f ./resources/ssl_conf.sh ./data/nginx/ssl/letsencrypt/conf.d/custom.sh");
	await utils.exec("docker restart nginx");
};

module.exports = {install, uninstall, setupNginx};
