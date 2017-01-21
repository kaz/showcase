"use strict";

const Manager = require("../helper/manager");
const AppModel = require("../model/app");

module.exports = async (ctx, next) => {
	if(!ctx.query.repo || !ctx.query.ref){
		return ctx.status = 400;
	}
	
	const target = await AppModel.find(ctx.token.admin ? null : ctx.token.name, ctx.query.repo, ctx.query.ref);
	if(!target){
		ctx.status = 403;
		ctx.body = "You cannot remove this application.";
		return await next();
	}
	
	console.log(`----- ${target.repo} (${target.branch}) -----`);
	
	const app = new AppModel();
	await app.resolve(target.repo, target.branch);
	
	await Manager.uninstall(app);
	
	console.log(`[*] Finished removing ${target.repo} (${target.branch})`);
	
	ctx.status = 200;
	ctx.body = "Removed";
	await next();
};
