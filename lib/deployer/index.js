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

const run = async (conn, repo) => {
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
		Logger.log("Config not found.");
		return;
	}
	
	// parse config
	const config = yaml.safeLoad(rawConfig);
	
	// [EXPERIMENTAL]
	// modify config for specific runtime
	if(config.image === "runtime/php"){
		config.expose = config.entrypoint = undefined;
		config.http_proxy = 9000;
	}
	
	// run deployer
	if(config.type in deployer){
		await deployer[config.type](conn, repo, config);
	}else{
		throw new Error("Unrecognized deploy type");
	}
	
	return true;
};

const cancel = common.cancel;

const remove = async (conn, repo) => {
	await cancel(repo);
	await common.unsetDatabases(conn, repo);
	
	const mongo = await conn.mongo();
	const app = mongo.db(settings.name).collection("applications");
	const log = mongo.db(settings.name).collection("logs");
	
	app.deleteMany({repo});
	log.deleteMany({repo});
};

const save = async (conn, repo) => {
	const mongo = await conn.mongo();
	const app = mongo.db(settings.name).collection("applications");
	app.deleteMany({repo});
	app.insertOne({repo, date: new Date});
};

const saveLog = async (conn, repo, log) => {
	const mongo = await conn.mongo();
	const logs = mongo.db(settings.name).collection("logs");
	logs.insertOne({repo, date: new Date, log});
};

module.exports = {run, cancel, remove, save, saveLog};
