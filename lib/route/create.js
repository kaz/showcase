"use strict";

const path = require("path");
const child_process = require("child_process");

const Logger = require("../helper/logger");
const Namespace = require("../helper/namespace");

module.exports = async (ctx, next) => {
	if(!ctx.token.git_hook && !ctx.token.admin){
		const ns = ctx.query.repo.split("/")[0];
		if(!(await Namespace.contained(ctx.token.name, ns))){
			ctx.status = 403;
			ctx.body = "You cannot create this application.";
			return;
		}
	}

	Logger.hr(`[create] ${ctx.query.repo} (${ctx.query.ref})`);

	const modulePath = path.resolve(path.join(__dirname, "../worker/deploy"));
	const child = child_process.fork(modulePath, [ctx.query.repo, ctx.query.ref], {cwd: process.cwd()});

	child.on("exit", _ => Logger.system(`Finished creating ${ctx.query.repo} (${ctx.query.ref})`));

	ctx.status = 200;
	ctx.body = "Deploy started: this job takes a while!";
};
