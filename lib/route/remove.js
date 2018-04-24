"use strict";

const Manager = require("../helper/manager");

module.exports = async (ctx, next) => {
	const {app} = ctx.state;
	const {repo, branch} = app.document;

	console.log(`----- [remove] ${repo} (${branch}) -----`);
	await Manager.uninstall(app);
	console.log(`[*] Finished removing ${repo} (${branch})`);

	ctx.status = 200;
	ctx.body = "Removed";
};
