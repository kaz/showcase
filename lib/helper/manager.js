"use strict";

const shellescape = require("shell-escape");

const utils = require("./utils");
const Docker = require("./docker");
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
	const cloneResult = await utils.exec(`git clone --recursive --depth 1 --branch ${shellescape([app.document.branch])} ${shellescape([app.clonePath])} ${shellescape([app.repoPath])}`).catch(() => null);
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
			return ignore(app, "Config file not found");
		}

		// ignore non-targeted branch
		if(!(app.document.branch in config.branch)){
			return ignore(app, "Excluded branch");
		}

		// check deploy type
		const fcgi = /^fcgi/.test(config.type);
		if(!fcgi && !(config.type in Deployers)){
			throw new Error("Unrecognized deploy type");
		}

		// make status `deploying`
		await Promise.all([app.log.deploying(), app.save()]);
		await app.updateStatus();

		// run deployer
		const dep = new Deployers[fcgi ? "runtime" : config.type](app);
		try {
			await dep.run();
			await app.log.succeeded(Logger.get());
		} catch(e) {
			await dep.cancel();
			throw e;
		}
	} catch(e) {
		Logger.exception(e);
		await app.log.failed(Logger.get());
	}

	// save application
	await app.save();
	await app.updateStatus();
};

const ignore = async (app, msg) => {
	Logger.exception(msg);
	Logger.log("Deleting repository ...");
	await uninstall(app);
};
const uninstall = async app => {
	const dep = new Deployers.static(app);
	await dep.cancel();
	await dep.unsetKey();
	await app.delete();
	await utils.rimraf(app.repoPath);
};

const setupNginx = async () => {
	await Promise.all([
		utils.renderToFile("system", {
			settings,
			listen: settings.listen,
			gateway: await Docker.gateway(),
		}, "./data/nginx/conf.d/!!system.conf"),
		utils.exec("cp -f ./resources/ssl_conf.sh ./data/nginx/autossl/letsencrypt/conf.d/custom.sh"),
		utils.exec("mkdir -p ./data/nginx/conf.d/c"),
		utils.exec("mkdir -p ./data/nginx/conf.d/ns"),
	]);
	await utils.exec("docker restart nginx");
};

module.exports = {install, uninstall, setupNginx};
