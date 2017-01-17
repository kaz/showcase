"use strict";

const ejs = require("ejs");
const path = require("path");

const utils = require("../helper/utils");
const Logger = require("../helper/logger");
const settings = require("../../settings");

const keyClass = [
	require("../key/maria"),
	require("../key/mongo"),
];

class Deployer {
	constructor(app, config){
		this.app = app;
		this.config = config;
		this.env = {};
	}
	async setupKey(){
		for(const keyInst of keyClass.map(Clas => new Clas(this.app))){
			if(keyInst.needed(this.config)){
				if(!keyInst.key){
					Logger.log(`Creating ${keyInst.type} key ...`);
					await keyInst.create();
				}
				for(const objKey in keyInst.key){
					this.env[`${keyInst.type}_${objKey}`.toUpperCase()] = keyInst.key[objKey];
				}
			}
		}
	}
	async unsetKey(){
		for(const keyInst of keyClass.map(Clas => new Clas(app))){
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
		const name = this.app.name;
		const repo = this.app.document.repo;
		const config = this.config;
		
		// get repository path
		const repoPath = path.resolve(path.join("./data/repositories", repo));
		
		// determine docker options
		const options = this.envForDocker;
		options.push(`--name ${name}`);
		options.push(`--hostname ${name}`);
		options.push(`--volume ${repoPath}:/srv`);
		options.push(config.expose ? `--publish ${config.expose}:${config.expose}` : ``);
		options.push(`--network ${settings.domain}`);
		options.push(`--workdir /srv`);
		options.push(config.image);
		
		const optStr = options.join(" ");
		
		// remove old container
		await utils.exec(`docker rm -f ${name}`).catch(_ => 0);
		
		// run setup script
		if(config.on_created){
			Logger.log("Running bootup script ...");
			await utils.exec(`docker run --interactive --rm --entrypoint bash ${optStr} -c '${config.on_created.replace(/'/g, "''")}'`);
		}
		
		// start container
		if(run){
			Logger.log("Running container ...");
			await utils.exec(`docker run -dit --restart always ${optStr} ${config.entrypoint}`);
		}
	}
	async nginx(){
		const name = this.app.name;
		const repo = this.app.document.repo;
		const config = this.config;
		
		// computed config
		const computed = {
			config_file: `${settings.name}.yaml`,
			servers: config.cname,
		};
		computed.servers.push(`${name}.${settings.domain}`);
		
		// determine document root
		computed.document_root = path.join("/srv", repo, config.document_root);
		computed.fastcgi_root = path.join("/srv", config.document_root, "/");
		
		// find IP address
		if(config.type === "runtime" && config.http_proxy){
			computed.proxy_pass = (await utils.getAddress(name)) + ":" + config.http_proxy;
		}
		
		// generate config
		const configFile = `./data/nginx/${name}.conf`;
		const configStr = ejs.render(await utils.readFile("./resources/nginx.conf.ejs", "utf-8"), {config, computed});
		await utils.writeFile(configFile, configStr);
		
		// check config
		Logger.log("Checking nginx config ...");
		await utils.exec("docker exec nginx nginx -t");
		
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
