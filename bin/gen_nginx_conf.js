"use strict";

const AppModel = require("../lib/model/app");
const Parser = require("../lib/helper/parser");
const Logger = require("../lib/helper/logger");
const Connector = require("../lib/helper/connector");
const Deployer = require("../lib/deployer/static");

const settings = require("../settings");

(async _ => {
	for(const app of await AppModel.all()){
		Logger.hr(app.name);

		// check if config is sanity
		try {
			await Parser.parseConfig(app, `${app.repoPath}/${settings.name}.yaml`);
		}catch(e){
			Logger.exception(e);
			continue;
		}

		// generate new nginx config
		await new Deployer(app).nginx();
	}

	Connector.close();
})();
