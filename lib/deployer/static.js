"use strict";

const Deployer = require("./");

class StaticDeployer extends Deployer {
	async run(){
		// run scripts
		if(this.app.document.config.startup){
			await this.docker(true);
		}
		
		// configure http server
		await this.nginx();
	}
}

module.exports = StaticDeployer;
