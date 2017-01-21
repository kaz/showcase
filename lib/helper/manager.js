"use strict";

const yaml = require("js-yaml");

const utils = require("./utils");
const Logger = require("./logger");
const settings = require("../../settings");

const Deployers = {
	static: require("../deployer/static"),
	runtime: require("../deployer/runtime"),
};

const parseConfig = async (app, filename) => {
	// find config
	const rawConfig = await utils.readFile(filename, "utf-8").catch(_ => null);
	if(!rawConfig){
		throw new Error("Config not found.");
	}
	
	// parse YAML
	const sources = [
		yaml.safeLoad(await utils.readFile(`./resources/default.yaml`, "utf-8")),
		yaml.safeLoad(rawConfig),
	];
	
	// override config
	if(sources[1].branch){
		const branchCfg = sources[1].branch[app.document.branch];
		if(branchCfg && typeof branchCfg === "object"){
			sources.push(branchCfg);
		}
	}
	
	// override config for runtime/php
	if(sources[1].image === "runtime/php"){
		sources.unshift({
			expose: null,
			entrypoint: "",
			http_proxy: 9000,
		});
	}
	
	// combine config sources
	const config = {};
	for(const src of sources){
		for(const key in src){
			config[key] = src[key];
		}
	}
	
	// normalization
	if(typeof config.cname === "string"){
		config.cname = [config.cname];
	}else if(!Array.isArray(config.cname)){
		throw new Error(`'cname' must be string or array`);
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

const install = async app => {
	// clone repo
	Logger.log("Cloning repository ...");
	const cloneResult = await utils.exec(`git clone --depth 1 --branch ${app.document.branch} ${app.clonePath} ${app.repoPath}`).catch(_ => null);
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
		config = await parseConfig(app, `${app.repoPath}/${settings.name}.yaml`);
		
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
		const dep = new Deployers[config.type](app, config);
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
