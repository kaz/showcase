"use strict";

const common = require("./common");

module.exports = async (app, config) => {
	// remove cache
	await common.cancel(app);
	
	// setup datbases
	const dbEnv = await common.setupDatabases(app, config);
	
	// run container
	const runner = await common.prepareDocker(app, config, dbEnv);
	await runner();
	
	// setup reverse proxy
	if(config.http_proxy){
		await common.setupNginx(app, config);
	}
};
