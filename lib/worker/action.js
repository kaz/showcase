"use strict";

const utils = require("../helper/utils");

(async _ => {
	setTimeout(_ => {
		console.error("[!] Time limit exceeded");
		process.exit(-1);
	}, 5 * 60 * 1000);

	const [,, action, name] = process.argv;
	await utils.exec(`docker ${action} ${name}`);
})().catch(e => {
	console.trace(e);
}).then(_ => {
	process.exit(0);
});
