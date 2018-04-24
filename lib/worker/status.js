"use strict";

const Connector = require("../helper/connector");
const AppModel = require("../model/app");

(async _ => {
	setTimeout(_ => {
		console.error("[!] Time limit exceeded");
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
