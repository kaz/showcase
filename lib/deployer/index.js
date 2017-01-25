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
			await keyInst.drop().catch(_ => 0);
		}
		this.env = {};
	}
	get envForDocker(){
		const opts = [];
		for(const key in this.env){
			opts.push(`--env ${key}="${this.env[key]}"`);
		}
		return opts;
	}
	async docker(run){
		const config = this.config;
		
		// remove old settings
		await this.cancel();
		
		// determine docker options
		const args = Parser.dockerArgStr(this.app);
		const runArgs = script => `--entrypoint bash ${args} -c '${script.replace(/'/g, "''")}'`;
		
		// run setup script
		if(config.startup){
			Logger.log("Running bootup script ...");
			await utils.exec(`docker run --interactive --rm ${runArgs(config.startup)}`);
		}
		
		// start container
		if(run){
			Logger.log("Running container ...");
			await utils.exec(`docker run -dit --restart always ${runArgs(config.entrypoint)}`);
		}
	}
	async nginx(){
		const config = this.config;
		
		// computed config
		const computed = {
			config_file: `${settings.name}.yaml`,
			servers: [`${this.app.name}.${settings.domain}`].concat(config.cname),
		};
		
		// determine document root
		computed.document_root = path.resolve(path.join(this.app.relativeRepoPath.replace("data/repositories", "/srv"), config.work_dir));
		computed.fastcgi_root = path.resolve(path.join("/srv", config.work_dir));
		
		// find IP address
		if(config.type === "runtime" && config.http_proxy){
			computed.proxy_pass = `${computed.servers[0]}:${config.http_proxy}`;
		}
		
		// generate config
		const configFile = `./data/nginx/${this.app.name}.conf`;
		await utils.renderConfig("apps", {config, computed}, configFile);
		
		// apply config
		Logger.log("Applying config ...");
		await utils.exec("docker exec nginx nginx -s reload");
	}
	async cancel(){
		await utils.unlink(`./data/nginx/${this.app.name}.conf`).catch(_ => 0);
		await utils.exec(`docker rm -f ${this.app.name}`).catch(_ => 0);
	}
}

module.exports = Deployer;
