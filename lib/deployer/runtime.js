"use strict";

const common = require("./common");

module.exports = async (repo, config) => {
	// run container
	const runner = await common.prepareDocker(repo, config);
	await runner();
	
	// setup reverse proxy
	if(config.http_proxy){
		await common.setupNginx(repo, config);
	}
};
