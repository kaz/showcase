"use strict";

const common = require("./common");

module.exports = async (app, config) => {
	// run scripts
	await common.prepareDocker(app, config, {});
	
	// setup nginx
	await common.setupNginx(app, config);
};
