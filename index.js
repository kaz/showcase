"use strict";

const Logger = require("./lib/logger");
const deployer = require("./lib/deployer");
const connector = require("./lib/connector");

(async _ => {
	const repo = "root/test";
	const conn = connector.new();
	if(0){
		const result = await deployer.run(conn, repo).catch(error => Logger.exception(error));
		if(result !== true){
			await deployer.cancel(repo);
		}
		await deployer.save(conn, repo);
		await deployer.saveLog(conn, repo, Logger.get());
	}else{
		await deployer.remove(conn, repo);
	}
	conn.close();
})().catch(error => console.trace(error));