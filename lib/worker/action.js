"use strict";

const Logger = require("../helper/logger");
const utils = require("../helper/utils");

(async () => {
	setTimeout(() => {
		Logger.exception("Time limit exceeded");
		process.exit(-1);
	}, 5 * 60 * 1000);

	const [,, action, name] = process.argv;
	await utils.exec(`docker ${action} ${name}`);
})().catch(e => {
	console.trace(e);
}).then(() => {
	process.exit(0);
});
