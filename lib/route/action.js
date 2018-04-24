"use strict";

const path = require("path");
const child_process = require("child_process");

const allowed = ["stop", "start", "restart"];

module.exports = async (ctx, next) => {
	if(!allowed.some(act => act === ctx.query.action)){
		ctx.body = "Unexpected action.";
		return ctx.status = 403;
	}

	const {app} = ctx.state;
	const {repo, branch} = app.document;

	console.log(`----- [action:${ctx.query.action}] ${repo} (${branch}) -----`);

	const modulePath = path.resolve(path.join(__dirname, "../worker/action"));
	const child = child_process.fork(modulePath, [ctx.query.action, app.name], {cwd: process.cwd()});

	child.on("exit", _ => console.log(`[*] Finished action:${ctx.query.action} ${repo} (${branch})`));

	ctx.status = 200;
	ctx.body = "Action requested: this job takes a while!";
};
