"use strict";

const Deployer = require("./");

class StaticDeployer extends Deployer {
	async run(){
		// run scripts
		await this.docker(false);
		
		// setup nginx
		await this.nginx();
	}
}

module.exports = StaticDeployer;
