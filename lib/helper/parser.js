"use strict";

const path = require("path");
const yaml = require("js-yaml");
const shellescape = require("shell-escape");

const utils = require("./utils");
const settings = require("../../settings");

const mergeObject = input => {
	const output = {};
	for(const item of input){
		for(const key in item){
			output[key] = item[key];
		}
	}
	return output;
};

const parseConfig = async (app, filename) => {
	// find config
	const rawConfig = await utils.readFile(filename, "utf-8").catch(_ => null);
	if(rawConfig === null){
		return null;
	}
	
	// parse YAML
	const sources = [
		yaml.safeLoad(await utils.readFile(`./resources/default.yaml`, "utf-8")),
		yaml.safeLoad(rawConfig) || {},
	];
	
	// override config
	if(sources[1].branch){
		const branchCfg = sources[1].branch[app.document.branch];
		if(branchCfg && typeof branchCfg === "object"){
			sources.push(branchCfg);
		}
	}
	
	// override config for runtime/php
	if(sources[1].image === "runtime/php" && !sources[1].entrypoint){
		sources.push({
			expose: null,
			entrypoint: "php-fpm --nodaemonize",
			http_proxy: 9000,
		});
	}
	
	// combine config sources
	const config = mergeObject(sources);
	
	// normalization
	if(typeof config.cname === "string"){
		config.cname = [config.cname];
	}else if(!Array.isArray(config.cname)){
		throw new Error(`'cname' must be string or array`);
	}
	
	// check cname availability
	const userDomain = `${app.namespace}.${settings.domain}`;
	const domains = [settings.domain].concat(settings.altDomains);
	
	for(const item of config.cname){
		if(new RegExp(`${settings.domain}$`).test(item) && !new RegExp(`\\.${userDomain}$`).test(item) && item != userDomain){
			throw new Error(`Cannot CNAME other namespace: ${item}`);
		}
		if(!domains.some(domain => new RegExp(`\\.${domain}$`).test(item))){
			throw new Error(`Cannot CNAME this domain: ${item}`);
		}
	}
	
	// save config
	return app.document.config = config;
};

const dockerArg = app => {
	const opts = [];
	const config = app.document.config;
	
	opts.push("--name");
	opts.push(app.name);
	opts.push("--hostname");
	opts.push(app.name);
	opts.push("--volume");
	opts.push(`${app.repoPath}:/srv`);
	opts.push("--network");
	opts.push(settings.domain);
	
	if(config.expose){
		opts.push("--publish");
		opts.push(`${config.expose}:${config.expose}`);
	}
	opts.push("--workdir");
	opts.push(path.resolve(path.join("/srv", config.work_dir)));
	
	const systemEnvs = {}
	for(const keyName in app.document.keys){
		for(const keyVar in app.document.keys[keyName]){
			systemEnvs[`${keyName}_${keyVar}`.toUpperCase()] = app.document.keys[keyName][keyVar];
		}
	}
	
	const envs = mergeObject([config.envs, systemEnvs]);
	for(const key in envs){
		opts.push("--env");
		opts.push(`${key}=${envs[key]}`);
	}
	
	opts.push(config.image);
	
	return opts;
};
const dockerArgStr = app => shellescape(dockerArg(app));

module.exports = {parseConfig, dockerArg, dockerArgStr};
