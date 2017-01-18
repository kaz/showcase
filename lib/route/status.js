"use strict";

const utils = require("../helper/utils");
const Manager = require("../helper/manager");
const AppModel = require("../model/app");

module.exports = async (ctx, next) => {
	if(!ctx.query.repo || !ctx.query.ref){
		return ctx.status = 400;
	}
	
	const apps = await AppModel.apps(ctx.trapToken.id);
	const target = apps.find(item => item.repo === ctx.query.repo && item.branch === ctx.query.ref);
	if(!target){
		ctx.status = 403;
		ctx.body = "You cannot see this application.";
		return await next();
	}
	
	const app = new AppModel();
	await app.resolve(target.repo, target.branch);
	
	ctx.status = 200;
	ctx.body = {
		entry: app.document,
		inspect: await utils.inspect(app),
		log: await utils.dockerLogs(app),
	};
	
	await next();
};
