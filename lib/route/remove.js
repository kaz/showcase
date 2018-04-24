"use strict";

const Manager = require("../helper/manager");

module.exports = async (ctx, next) => {
	const {app} = ctx.state;

	console.log(`----- ${app.repo} (${app.branch}) -----`);
	await Manager.uninstall(app);
	console.log(`[*] Finished removing ${app.repo} (${app.branch})`);

	ctx.status = 200;
	ctx.body = "Removed";

	await next();
};
