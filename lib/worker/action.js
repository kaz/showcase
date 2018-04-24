"use strict";

const utils = require("../helper/utils");
const Logger = require("../helper/logger");

(async _ => {
	setTimeout(_ => {
		Logger.exception("Time limit exceeded");
		process.exit(-1);
	}, 5 * 60 * 1000);

	const [,, action, name] = process.argv;
	await utils.exec(`docker ${action} ${name}`);
})().catch(e => {
	console.trace(e);
}).then(_ => {
	process.exit(0);
});
