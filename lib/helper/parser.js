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
	const rawConfig = await utils.readFile(filename, "utf-8").catch(() => null);
	if(rawConfig === null){
		return null;
	}

	// parse YAML
	const sources = [
		yaml.safeLoad(await utils.readFile("./resources/default.yaml", "utf-8")),
		yaml.safeLoad(rawConfig) || {},
	];

	// override config
	if(sources[1].branch){
		const branchCfg = sources[1].branch[app.document.branch];
		if(branchCfg && typeof branchCfg === "object"){
			sources.push(branchCfg);
		}
	}

	// override config for fcgi-php
	const subc = mergeObject(sources.slice(1));
	if(subc.type === "fcgi-php"){
		sources.push({
			entrypoint: `
				chown -R http:http .
				${subc.entrypoint || ""}
				php-fpm --nodaemonize
			`,
			http_proxy: 9000,
		});
	}

	// combine config sources
	const config = mergeObject(sources);

	// normalization
	if(typeof config.cname === "string"){
		config.cname = [config.cname];
	}else if(!Array.isArray(config.cname)){
		throw new Error("'cname' must be string or array");
	}

	// check cname availability
	for(const item of config.cname){
		for(const deny of settings.denyDomains){
			if(item == deny || new RegExp(`\\.${deny}$`).test(item)){
				throw new Error(`Cannot CNAME this domain: ${item}`);
			}
		}
	}

	// normalization
	config.expose = (Array.isArray(config.expose) ? config.expose : [config.expose]).map(parseInt).filter(e => e);

	// check expose availability
	for(const port of config.expose){
		for(const deny of settings.denyExposes){
			if(port == deny){
				throw new Error(`Cannot EXPOSE this port: ${port}`);
			}
		}
	}

	// save config
	return app.document.config = config;
};

const dockerArg = app => {
	const opts = [];
	const {config, keys, envs: appEnvs} = app.document;

	opts.push("--name");
	opts.push(app.name);
	opts.push("--hostname");
	opts.push(app.name);
	opts.push("--volume");
	opts.push(`${app.repoPath}:/srv`);
	opts.push("--network");
	opts.push(settings.domain);
	opts.push("--workdir");
	opts.push(path.resolve("/srv", config.work_dir));

	if(config.expose){
		(Array.isArray(config.expose) ? config.expose : [config.expose]).forEach(e => {
			opts.push("--publish");
			opts.push(`${e}:${e}`);
		});
	}

	const systemEnvs = {};
	for(const keyName in keys){
		for(const keyVar in keys[keyName]){
			systemEnvs[`${keyName}_${keyVar}`.toUpperCase()] = keys[keyName][keyVar];
		}
	}

	const envs = mergeObject([config.envs, appEnvs, systemEnvs]);
	for(const key in envs){
		opts.push("--env");
		opts.push(`${key}=${envs[key]}`);
	}

	opts.push("--tty");
	opts.push("--restart");
	opts.push("always");
	opts.push("--memory-reservation");
	opts.push("256M");
	opts.push("--entrypoint");
	opts.push("bash");

	// [undocumented] use original image
	opts.push(config.__image || "runtime");

	return opts;
};
const dockerArgStr = app => shellescape(dockerArg(app));

module.exports = {parseConfig, dockerArg, dockerArgStr};
