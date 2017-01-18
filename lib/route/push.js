"use strict";

const path = require("path");
const child_process = require("child_process");

module.exports = async ctx => {
	if(!ctx.query.repo || !ctx.query.ref){
		return ctx.status = 400;
	}
	
	console.log(`----- ${ctx.query.repo} (${ctx.query.ref}) -----`);
	
	const modulePath = path.resolve(path.join(__dirname, "../worker/deploy"));
	const child = child_process.fork(modulePath, [ctx.query.repo, ctx.query.ref], {cwd: process.cwd()});
	
	child.on("exit", _ => console.log("<<< Finished >>>"));
	
	ctx.status = 200;
	ctx.body = "Job queued";
};
