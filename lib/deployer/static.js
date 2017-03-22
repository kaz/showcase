"use strict";

const Deployer = require("./");

class StaticDeployer extends Deployer {
	async run(){
		// run scripts
		await this.docker(false);
		
		// configure http server
		await this.caddy();
	}
}

module.exports = StaticDeployer;
