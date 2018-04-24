"use strict";

const Logger = require("../helper/logger");
const Manager = require("../helper/manager");
const Connector = require("../helper/connector");
const AppModel = require("../model/app");
const LogModel = require("../model/log");

(async _ => {
	const app = (await AppModel.one(null, process.argv[2], process.argv[3])) || (await AppModel.new(process.argv[2], process.argv[3]));

	setTimeout(async _ => {
		Logger.exception("Time limit exceeded");
		await app.log.failed(Logger.get());
		Connector.close();
		process.exit(-1);
	}, 5 * 60 * 1000);

	await Manager.install(app);
})().catch(e => {
	console.trace(e);
}).then(_ => {
	Connector.close();
	process.exit(0);
});
