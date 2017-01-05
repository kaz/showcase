"use strict";

const common = require("./common");

module.exports = async (repo, config) => {
	// run scripts
	await common.prepareDocker(repo, config);
	
	// setup nginx
	await common.setupNginx(repo, config);
};
