"use strict";

const utils = require("../helper/utils");
const Connector = require("../helper/connector");
const AppModel = require("../model/app");

(async _ => {
	setTimeout(_ => {
		Logger.exception("Time limit exceeded");
		process.exit(-1);
	}, 5 * 60 * 1000);

	for(const app of await AppModel.all()){
		await app.updateStatus();
	}
})().catch(e => {
	console.trace(e);
}).then(_ => {
	Connector.close();
	process.exit(0);
});
