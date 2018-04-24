"use strict";

const Logger = require("../helper/logger");
const Manager = require("../helper/manager");
const Connector = require("../helper/connector");
const AppModel = require("../model/app");

(async _ => {
	const app = (await AppModel.one(null, process.argv[2], process.argv[3])) || (await AppModel.new(process.argv[2], process.argv[3]));
	await app.setStatus("deploying");

	setTimeout(_ => {
		Logger.exception("Time limit exceeded");
		app.addLog("Failed", Logger.get());
		app.save().then(_ => {
			Connector.close();
			process.exit(-1);
		});
	}, 5 * 60 * 1000);

	await Manager.install(app);
	await app.updateStatus();
})().catch(e => {
	console.trace(e);
}).then(_ => {
	Connector.close();
	process.exit(0);
});
