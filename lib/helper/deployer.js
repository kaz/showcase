"use strict";

const path = require("path");
const yaml = require("js-yaml");

const utils = require("./utils");
const Logger = require("./logger");
const settings = require("../../settings");

const deployers = {
	static: require("../deployer/static"),
	runtime: require("../deployer/runtime"),
};

const parseConfig = async (app, filename) => {
	// find config
	const rawConfig = await utils.readFile(filename, "utf-8").catch(_ => null);
	if(!rawConfig){
		throw new Error("Config not found.");
	}
	
	// parse yaml
	const sources = [
		yaml.safeLoad(rawConfig),
		yaml.safeLoad(await utils.readFile(`./resources/default.yaml`, "utf-8")),
	];
	
	// set override config
	if(rawConfig.branch && (app.document.branch in rawConfig.branch)){
		source.push(rawConfig.branch[app.document.branch]);
	}
	
	// proxy config
	const config = new Proxy(sources[0], {
		get: (target, property) => {
			for(const s of sources){
				if(property in s){
					return s[property];
				}
			}
		}
	});
	
	// normalization
	if(typeof config.cname === "string"){
		config.cname = [config.cname];
	}else if(!Array.isArray(config.cname)){
		throw new Error(`Invalid config: cname`);
	}
	
	// check cname availability
	const userDomain = `${app.namespace}.${settings.domain}`;
	for(const item of config.cname){
		if(new RegExp(`${settings.domain}$`).test(item) && !new RegExp(`\\.${userDomain}$`).test(item) && item != userDomain){
			console.log(`Cannot CNAME other namespace: ${item}`);
		}
		if(/^.*\.?trapti\.tech$/.test(item)){
			console.log(`Cannot CNAME system domain: ${item}`);
		}
	}
	
	// save config
	app.document.config = config;
	
	return config;
};

const run = async app => {
	let dep;
	
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
		
		// parse config
		Logger.log("Parsing config ...");
		const config = await parseConfig(app, `${repoPath}/${settings.name}.yaml`);
		
		// modify config for specific runtime
		if(config.image === "runtime/php"){
			config.expose = config.entrypoint = undefined;
			config.http_proxy = 9000;
		}
		
		if(config.type in deployers){
			// run deployer
			dep = new deployers[config.type](app, config);
			await dep.run();
		}else{
			throw new Error("Unrecognized deploy type");
		}
	} catch(e) {
		if(dep){
			await dep.cancel();
		}
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
