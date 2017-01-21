"use strict";

const utils = require("../helper/utils");
const AppModel = require("../model/app");

module.exports = async (ctx, next) => {
	if(!ctx.query.repo || !ctx.query.ref){
		return ctx.status = 400;
	}
	
	const target = await AppModel.find(ctx.token.admin ? null : ctx.token.name, ctx.query.repo, ctx.query.ref);
	if(!target){
		ctx.status = 403;
		ctx.body = "You cannot see this application.";
		return await next();
	}
	
	const app = new AppModel();
	await app.resolve(target.repo, target.branch);
	
	app.document.status = app.isStatic ? "running" : (await utils.inspect(app)).State.Status;
	app.document.stdout = app.isStatic ? "" : await utils.dockerLogs(app);
	
	ctx.status = 200;
	ctx.body = app.document;
	
	await next();
};
