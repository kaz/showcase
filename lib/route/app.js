"use strict";

const Docker = require("../helper/docker");

module.exports = async (ctx, next) => {
	const {app} = ctx.state;

	const [logs, stdout] = await Promise.all([
		app.log.get(),
		Docker.logs(app),
		app.updateStatus(),
	]);

	ctx.status = 200;
	ctx.body = {app: app.document, logs, stdout};
};
