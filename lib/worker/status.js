"use strict";

const Logger = require("../helper/logger");
const Connector = require("../helper/connector");
const AppModel = require("../model/app");

(async () => {
	setTimeout(() => {
		Logger.exception("Time limit exceeded");
		process.exit(-1);
	}, 5 * 60 * 1000);

	for(const app of await AppModel.all()){
		await app.updateStatus();
	}
})().catch(e => {
	console.trace(e);
}).then(() => {
	Connector.close();
	process.exit(0);
});
