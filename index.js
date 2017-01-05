"use strict";

const Logger = require("./lib/logger");
const deployer = require("./lib/deployer");

deployer("root/test").catch(error => {
	Logger.exception(error);
	console.trace(error);
});
