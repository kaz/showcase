"use strict";

const Deployer = require("./");

class RuntimeDeployer extends Deployer {
	async run(){
		// setup databases
		await this.setupKey();
		
		// run container
		await this.docker(true);
		
		// configure reverse proxy
		if(this.config.http_proxy){
			await this.nginx();
		}
	}
}

module.exports = RuntimeDeployer;
