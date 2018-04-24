"use strict";

const utils = require("../helper/utils");

const allowed = ["stop", "start", "restart"];

module.exports = async (ctx, next) => {
	if(!allowed.some(act => act === ctx.query.action)){
		ctx.body = "Unexpected action.";
		return ctx.status = 403;
	}

	const {app} = ctx.state;

	console.log(`----- ${app.repo} (${app.branch}) -----`);
	await utils.exec(`docker ${ctx.query.action} ${app.name}`);
	console.log(`[*] Finished ${ctx.query.action} ${app.repo} (${app.branch})`);

	ctx.status = 200;
	ctx.body = "OK";

	await next();
};
