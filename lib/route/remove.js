"use strict";

const Logger = require("../helper/logger");
const Manager = require("../helper/manager");

module.exports = async (ctx, next) => {
	const {app} = ctx.state;
	const {repo, branch} = app.document;

	Logger.hr(`[remove] ${repo} (${branch})`);
	await Manager.uninstall(app);
	Logger.system(`Finished removing ${repo} (${branch})`);

	ctx.status = 200;
	ctx.body = "Removed";
};
