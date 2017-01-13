"use strict";

const ejs = require("ejs");
const path = require("path");

const utils = require("../utils");
const Logger = require("../logger");

const identityClasses = [
	require("../identity/maria"),
	require("../identity/mongo")
];

const setupDatabases = async (conn, repo, config) => {
	const dbEnv = {};
	
	for(const identity of identityClasses.map(clas => clas.new(conn))){
		if(identity.check(config)){
			if(!(await identity.resolve(repo))){
				await identity.create(repo);
			}
			const doc = identity.get();
			for(const key of ["host", "data", "user", "pass"]){
				dbEnv[`${doc.type}_${key}`.toUpperCase()] = doc[key];
			}
		}
	}
	
	return dbEnv;
};
const unsetDatabases = async (conn, repo) => {
	for(const identity of identityClasses.map(clas => clas.new(conn))){
		await identity.drop(repo).catch(_ => 0);;
	}
};

const __freezeEnv = env => {
	const opts = [];
	for(const key in env){
		opts.push(`--env ${key}="${env[key]}"`);
	}
	return opts;
};

const prepareDocker = async (repo, config, dbEnv) => {
	// determine server_name
	const name = utils.repo2name(repo);
	
	// get repository path
	const repoPath = path.resolve(path.join("./data/repositories", repo));
	
	// determine docker options
	const options = __freezeEnv(dbEnv);
	options.push(`--name ${name}`);
	options.push(`--hostname ${name}`);
	options.push(`--volume ${repoPath}:/srv`);
	options.push(config.expose ? `--publish ${config.expose}:${config.expose}` : ``);
	options.push(`--network tra.plus`);
	options.push(`--restart always`);
	options.push(`--workdir /srv`);
	options.push(config.image || `kazsw/arch`);
	
	if(config.on_created){
		// generate setup script
		const tmpFile = await utils.tmpName();
		await utils.writeFile(tmpFile, `#!/bin/bash -xe\n${config.on_created}`);
		
		// run setup script
		Logger.log("Running bootup script ...");
		await utils.exec(`docker rm -f ${name} || true`);
		await utils.exec(`docker create --entrypoint bash ${options.join(" ")} /root/setup.sh`);
		await utils.exec(`docker cp ${tmpFile} ${name}:/root/setup.sh`);
		await utils.exec(`docker start -i ${name}`);
		
		// delete setup script
		await utils.unlink(tmpFile);
	}
	
	// start container
	Logger.log("Running container ...");
	await utils.exec(`docker rm -f ${name} || true`);
	return async _ => await utils.exec(`docker run -dit ${options.join(" ")} ${config.entrypoint || ""}`);
};

const setupNginx = async (repo, config) => {
	// computed config
	const computed = {};
	
	// determine default server name
	const name = utils.repo2name(repo);
	computed.servers = [`${name}.tra.plus`];
	
	// set additional server names
	const checkPush = cname => {
		if(/^.*\.?tra\.plus$/.test(cname) || /^.*\.?trapti\.tech$/.test(cname)){
			throw new Error(`Cannot CNAME: ${cname}`);
		}
		computed.servers.push(cname);
	};
	if(typeof config.cname === "string"){
		checkPush(config.cname);
	}else if(Array.isArray(config.cname)){
		for(const cname of config.cname){
			checkPush(cname);
		}
	}
	
	// determine document root
	computed.document_root = path.join("/srv", repo, config.document_root || ".");
	computed.fastcgi_root = path.join("/srv", config.document_root || ".", "/");
	
	// find IP address
	if(config.type === "runtime" && config.http_proxy){
		computed.proxy_pass = (await utils.getAddress(name)) + ":" + config.http_proxy;
	}
	
	// generate config
	const configFile = `./data/nginx/${name}.conf`;
	const configStr = ejs.render(await utils.readFile("./resources/nginx.conf.ejs", "utf-8"), {config, computed});
	await utils.writeFile(configFile, configStr);
	
	// apply config
	Logger.log("Checking nginx config ...");
	await utils.exec("docker exec nginx nginx -t");
	
	Logger.log("Applying config ...");
	await utils.exec("docker exec nginx nginx -s reload");
};

const cancel = async repo => {
	const name = utils.repo2name(repo);
	await utils.unlink(`./data/nginx/${name}.conf`).catch(_ => 0);
	await utils.exec(`docker rm -f ${name}`).catch(_ => 0);
};

module.exports = {setupDatabases, unsetDatabases, prepareDocker, setupNginx, cancel};
