"use strict";

const Deployer = require("./");

class RuntimeDeployer extends Deployer {
	async run(){
		// remove caches
		await this.cancel();
		
		// setup databases
		await this.setupKey();
		
		// run container
		await this.docker(true);
		
		// setup reverse proxy
		if(this.config.http_proxy){
			await this.nginx();
		}
	}
}

module.exports = RuntimeDeployer;
