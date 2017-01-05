"use strict";

const fs = require("fs");
const ejs = require("ejs");
const tmp = require("tmp");
const path = require("path");
const Promise = require("bluebird");
const child_process = require("child_process");

const unlink = Promise.promisify(fs.unlink);
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const tmpName = Promise.promisify(tmp.tmpName);
const exec = Promise.promisify(child_process.exec);

const getName = repo => repo.split("/").reverse().join(".") + ".tra.plus";

const prepareDocker = async (repo, config) => {
	// determine server_name
	const name = getName(repo);
	
	// get repository path
	const repoPath = path.join(process.cwd(), "./data/repositories", repo);
	
	// determine docker options
	let options = "";
	options += `--name ${name} `;
	options += `--volume ${repoPath}:/srv `;
	options += config.dynamic.expose ? `--publish ${config.dynamic.expose}:${config.dynamic.expose} ` : "";
	options += `--network traplus `;
	options += `--restart always `;
	options += config.dynamic.image || "kazsw/arch";
	
	if(config.on_created){
		// generate setup script
		const tmpFile = await tmpName();
		writeFile(tmpFile, `#!/bin/bash -xe\n${config.on_created}`);
		
		// run setup script
		await exec(`docker rm -f ${name} || true`);
		await exec(`docker create --workdir /srv ${options} bash /root/setup.sh`);
		await exec(`docker cp ${tmpFile} ${name}:/root/setup.sh`);
		const output = await exec(`docker start -i ${name}`);
		console.log(output);
		
		// delete setup script
		await unlink(tmpFile);
	}
	
	// start container
	await exec(`docker rm -f ${name} || true`);
	return async _ => await exec(`docker run -dit ${options} ${config.dynamic.entrypoint || "read"}`);
};

const setupNginx = async (repo, config) => {
	// determine default server name
	const servers = [getName(repo)];
	
	// set additional server names
	const checkPush = name => {
		if(/^.*tra.plus$/.test(name)){
			throw new Error(`Cannot CNAME: ${name}`);
		}
		servers.push(name);
	};
	if(typeof config.cname === "string"){
		checkPush(config.cname);
	}else if(Array.isArray(config.cname)){
		for(const name of config.cname){
			checkPush(name);
		}
	}
	
	// determine document root
	const docRoot = path.join("/srv", repo, config.static.document_root || "./");
	
	// find IP address
	const proxyPass = await (async _ => {
		if(config.type === "dynamic" && config.dynamic.http_proxy){
			const stat = await exec(`docker inspect ${servers[0]}`);
			return JSON.parse(stat)[0].NetworkSettings.Networks.traplus.IPAddress + ":" + config.dynamic.http_proxy;
		}
		return undefined;
	})();
	
	// generate config
	const configFile = `./data/nginx/${servers[0]}.conf`;
	const configStr = ejs.render(await readFile(`./templates/nginx_${config.type}.ejs`, "utf-8"), {servers, docRoot, proxyPass});
	await writeFile(configFile, configStr);
	
	// apply config
	try {
		await exec("docker exec nginx nginx -t");
	} catch(e) {
		await unlink(configFile);
		throw e;
	}
	await exec("docker restart nginx");
};

module.exports = {prepareDocker, setupNginx};
