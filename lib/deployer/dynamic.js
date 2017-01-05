"use strict";

const common = require("./common");

module.exports = async (repo, config) => {
	// launch container
	const launcher = await common.prepareDocker(repo, config);
	await launcher();
	
	// setup reverse proxy
	if(config.dynamic.http_proxy){
		await common.setupNginx(repo, config);
	}
};
