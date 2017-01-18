"use strict";

const path = require("path");
const child_process = require("child_process");

const AppModel = require("../model/app");

module.exports = async (ctx, next) => {
	if(!ctx.query.repo || !ctx.query.ref){
		return ctx.status = 400;
	}
	
	if(("git_hook" in ctx.trapToken) && ctx.trapToken.git_hook){
		console.log("# Received git hook");
	}else{
		const ns = ctx.query.repo.split("/")[0];
		const namespaces = await AppModel.namespaces(ctx.trapToken.id);
		if(!namespaces.some(item => item === ns)){
			ctx.status = 403;
			ctx.body = "You cannot create this application.";
			return await next();
		}
	}
	
	console.log(`----- ${ctx.query.repo} (${ctx.query.ref}) -----`);
	
	const modulePath = path.resolve(path.join(__dirname, "../worker/deploy"));
	const child = child_process.fork(modulePath, [ctx.query.repo, ctx.query.ref], {cwd: process.cwd()});
	
	child.on("exit", _ => console.log("<<< Finished >>>"));
	
	ctx.status = 200;
	ctx.body = "Job queued";
	await next();
};
