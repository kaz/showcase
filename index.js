"use strict";

const Logger = require("./lib/logger");
const deployer = require("./lib/deployer");
const connector = require("./lib/connector");

(async _ => {
	const repo = "root/test";
	const conn = connector.new();
	if(1){
		await deployer.run(conn, repo);
	}else{
		await deployer.remove(conn, repo);
	}
	conn.close();
})().catch(error => console.trace(error));