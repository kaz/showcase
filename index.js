"use strict";

const utils = require("./lib/helper/utils");
const Logger = require("./lib/helper/logger");
const Deployer = require("./lib/helper/deployer");
const Connector = require("./lib/helper/connector");

const AppModel = require("./lib/model/app");

(async _ => {
	await Deployer.setupNginxSystem();
	
	const app = new AppModel();
	await app.resolve("kaz/m", "master");
	
	if(0){
		await Deployer.run(app);
	}else{
		await Deployer.remove(app);
	}
	
	Connector.close();
})().catch(error => console.trace(error));