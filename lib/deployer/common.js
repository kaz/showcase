"use strict";

const ejs = require("ejs");
const path = require("path");

const utils = require("../utils");
const Logger = require("../logger");

const getName = repo => repo.split("/").reverse().join(".") + ".tra.plus";

const prepareDocker = async (repo, config) => {
	// determine server_name
	const name = getName(repo);
	
	// get repository path
	const repoPath = path.resolve(path.join("./data/repositories", repo));
	
	// determine docker options
	let options = "";
	options += `--name ${name} `;
	options += `--hostname ${name} `;
	options += `--volume ${repoPath}:/srv `;
	options += config.expose ? `--publish ${config.expose}:${config.expose} ` : "";
	options += `--network traplus `;
	options += `--restart always `;
	options += config.image || "kazsw/arch";
	
	if(config.on_created){
		// determine docker working options
		let workOpts = "";
		workOpts += "--entrypoint bash ";
		workOpts += "--workdir /srv ";
		
		// generate setup script
		const tmpFile = await utils.tmpName();
		await utils.writeFile(tmpFile, `#!/bin/bash -xe\n${config.on_created}`);
		
		// run setup script
		Logger.log("Running bootup script ...");
		await utils.exec(`docker rm -f ${name} || true`);
		await utils.exec(`docker create ${workOpts} ${options} /root/setup.sh`);
		await utils.exec(`docker cp ${tmpFile} ${name}:/root/setup.sh`);
		await utils.exec(`docker start -i ${name}`);
		
		// delete setup script
		await utils.unlink(tmpFile);
	}
	
	// start container
	Logger.log("Running container ...");
	await utils.exec(`docker rm -f ${name} || true`);
	return async _ => await utils.exec(`docker run -dit ${options} ${config.entrypoint || ""}`);
};

const setupNginx = async (repo, config) => {
	// computed config
	const computed = {};
	
	// determine default server name
	const name = getName(repo);
	computed.servers = [name];
	
	// set additional server names
	const checkPush = name => {
		if(/^.*tra.plus$/.test(name)){
			throw new Error(`Cannot CNAME: ${name}`);
		}
		computed.servers.push(name);
	};
	if(typeof config.cname === "string"){
		checkPush(config.cname);
	}else if(Array.isArray(config.cname)){
		for(const cname of config.cname){
			checkPush(cname);
		}
	}
	
	// determine document root
	computed.document_root = path.join("/srv", repo, config.document_root || "./");
	
	// find IP address
	computed.proxy_pass = await (async _ => {
		if(config.type === "runtime" && config.http_proxy){
			Logger.log("Getting IP address ...");
			const stat = await utils.exec(`docker inspect ${name}`, true);
			return JSON.parse(stat)[0].NetworkSettings.Networks.traplus.IPAddress + ":" + config.http_proxy;
		}
		return undefined;
	})();
	
	// generate config
	const configFile = `./data/nginx/${name}.conf`;
	const configStr = ejs.render(await utils.readFile("./resources/nginx.conf.ejs", "utf-8"), {config, computed});
	await utils.writeFile(configFile, configStr);
	
	// apply config
	try {
		Logger.log("Checking nginx config ...");
		await utils.exec("docker exec nginx nginx -t");
	} catch(e) {
		await utils.unlink(configFile);
		throw e;
	}
	Logger.log("Applying config ...");
	await utils.exec("docker exec nginx nginx -s reload");
};

module.exports = {prepareDocker, setupNginx};
