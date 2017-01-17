"use strict";

const Logger = require("./lib/logger");
const Deployer = require("./lib/deployer");
const Connector = require("./lib/connector");
const AppModel = require("./lib/model/app");

(async _ => {
	const app = new AppModel();
	await app.resolve("root/test", "master");
	
	if(1){
		await Deployer.run(app);
	}else{
		await Deployer.remove(app);
	}
	
	Connector.close();
})().catch(error => console.trace(error));