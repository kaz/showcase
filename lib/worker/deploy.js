"use strict";

const Logger = require("../helper/logger");
const Manager = require("../helper/manager");
const Connector = require("../helper/connector");
const AppModel = require("../model/app");

(async _ => {
	const app = new AppModel();
	await app.resolve(process.argv[2], process.argv[3]);
	
	setTimeout(_ => {
		Logger.exception("Time limit exceeded");
		app.addLog("Failed", Logger.get());
		app.save().then(_ => {
			Connector.close();
			process.exit(-1);
		});
	}, 5 * 60 * 1000);
	
	await Manager.install(app);
})().catch(e => {
	console.trace(e);
}).then(_ => {
	Connector.close();
	process.exit(0);
});
