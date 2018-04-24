"use strict";

const utils = require("../helper/utils");

module.exports = async (ctx, next) => {
	const {app} = ctx.state;

	await app.updateStatus();

	ctx.status = 200;
	ctx.body = await utils.dockerLogs(app);
};
