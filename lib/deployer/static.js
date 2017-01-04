"use strict";

const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const Promise = require("bluebird");
const child_process = require("child_process");

const unlink = Promise.promisify(fs.unlink);
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const exec = Promise.promisify(child_process.exec);

module.exports = async (repo, config) => {
	const docroot = path.join("/srv", repo, config.static.document_root || "./");
	const servers = [repo.split("/").reverse().join(".") + ".tra.plus"];
	
	const checkPush = name => {
		if(/^.*tra.plus$/.test(name)){
			throw new Error(`Cannot CNAME: ${name}`);
		}
		servers.push(name);
	};
	
	if(typeof config.cname === "array"){
		for(const name of config.cname){
			checkPush(name);
		}
	}else if(typeof config.cname === "string"){
		checkPush(config.cname);
	}
	
	const configFile = `./data/nginx/${servers[0]}.conf`;
	await writeFile(configFile, ejs.render(await readFile("templates/nginx_static.ejs", "utf-8"), {docroot, servers}));
	
	try {
		await exec("docker exec nginx nginx -t");
	} catch(e) {
		await unlink(configFile);
		throw e;
	}
	await exec("docker restart nginx");
};
