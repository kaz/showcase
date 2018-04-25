"use strict";

const AppModel = require("../lib/model/app");
const Connector = require("../lib/helper/connector");

(async _ => {
	for(const app of await AppModel.all()){
		const {document: {_id, repo, branch, config, keys, created}} = app;
		app.document = {_id, repo, branch, status: null, config, keys, envs: {}, created};
		await app.save();
	}
	Connector.close();
})();
