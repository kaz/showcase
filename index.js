"use strict";

const Logger = require("./lib/logger");
const deployer = require("./lib/deployer");
const connector = require("./lib/connector");

const conn = connector.new();
deployer(conn, "root/test").catch(error => {
	Logger.exception(error);
	console.trace(error);
}).then(_ => conn.close());