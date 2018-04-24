"use strict";

const Docker = require("../helper/docker");
const LogModel = require("../model/log");

const index = async (ctx, next) => {
	const {app} = ctx.state;

	const [logs, stdout] = await Promise.all([
		app.log.get(),
		Docker.logs(app),
		app.updateStatus(),
	]);

	ctx.status = 200;
	ctx.body = {logs, stdout};
};
const my = async (ctx, next) => {
	ctx.status = 200;
	ctx.body = await LogModel.getByUser(ctx.token.name);
};

module.exports = {index, my};
