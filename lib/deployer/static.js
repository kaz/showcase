"use strict";

const Deployer = require("./");

class StaticDeployer extends Deployer {
	async run(){
		// run scripts
		await this.docker(false);
		
		// configure http server
		await this.nginx();
	}
}

module.exports = StaticDeployer;
