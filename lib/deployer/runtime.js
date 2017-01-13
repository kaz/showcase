"use strict";

const common = require("./common");

module.exports = async (conn, repo, config) => {
	// remove cache
	await common.cancel(repo);
	
	// setup datbases
	const dbEnv = await common.setupDatabases(conn, repo, config);
	
	// run container
	const runner = await common.prepareDocker(repo, config, dbEnv);
	await runner();
	
	// setup reverse proxy
	if(config.http_proxy){
		await common.setupNginx(repo, config);
	}
};
