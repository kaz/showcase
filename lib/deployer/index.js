"use strict";

const path = require("path");

const utils = require("../helper/utils");
const Parser = require("../helper/parser");
const Logger = require("../helper/logger");
const settings = require("../../settings");

const keyClass = [
	require("../key/maria"),
	require("../key/mongo"),
];

class Deployer {
	constructor(app){
		this.app = app;
		this.config = app.document.config;
	}
	async setupKey(){
		for(const keyInst of keyClass.map(Clas => new Clas(this.app))){
			if(keyInst.needed(this.config) && !keyInst.key){
				Logger.log(`Creating ${keyInst.type} key ...`);
				await keyInst.create();
			}
		}
	}
	async unsetKey(){
		for(const keyInst of keyClass.map(Clas => new Clas(this.app))){
			Logger.log(`Dropping ${keyInst.type} key ...`);
			await keyInst.drop().catch(() => 0);
		}
		this.env = {};
	}
	async docker(onlyStartup){
		const config = this.config;

		// remove old settings
		await this.cancel();

		// create directory
		const scriptPath = path.join(this.app.repoPath, `.${settings.name}/entrypoint.sh`);
		await utils.mkdir(path.dirname(scriptPath)).catch(() => 0);

		// create container
		Logger.log("Creating container ...");
		await utils.exec(`docker create ${Parser.dockerArgStr(this.app)} /srv/.showcase/entrypoint.sh`);

		// run setup script
		if(config.startup){
			Logger.log("Running startup script ...");
			await utils.writeFile(scriptPath, config.startup);
			await utils.exec(`docker start -ai ${this.app.name}`, true);
		}

		if(onlyStartup){
			Logger.log("Removing container ...");
			await utils.exec(`docker rm -f ${this.app.name}`);
		}else{
			Logger.log("Running container ...");
			await utils.writeFile(scriptPath, config.entrypoint);
			await utils.exec(`docker start ${this.app.name}`, true);
		}
	}
	async nginx(){
		const config = this.config;

		// computed config
		const computed = {
			servers: [`${this.app.name}.${settings.domain}`].concat(config.cname),
		};

		// determine document root
		computed.document_root = path.resolve(this.app.relativeRepoPath.replace("data/repositories", "/srv"), config.work_dir);
		computed.fastcgi_root = path.resolve("/srv", config.work_dir);

		// determine proxy destination
		if(/^fcgi/.test(config.type) || config.type === "runtime" && config.http_proxy){
			computed.proxy_pass = `${computed.servers[0]}:${config.http_proxy}`;
		}

		// generate config
		const configFile = `./data/nginx/conf.d/${this.app.name}.conf`;
		await utils.renderConfig("apps", {config, computed, settings}, configFile);

		// apply config
		Logger.log("Applying config ...");
		await utils.exec("docker exec nginx nginx -s reload");
	}
	async cancel(){
		await utils.exec(`docker rm -f ${this.app.name}`).catch(() => 0);
		await utils.unlink(`./data/nginx/conf.d/${this.app.name}.conf`).catch(() => 0);
		await utils.exec("docker exec nginx nginx -s reload");
	}
}

module.exports = Deployer;
