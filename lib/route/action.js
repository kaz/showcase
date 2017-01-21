"use strict";

const utils = require("../helper/utils");
const AppModel = require("../model/app");

const allowedAction = [
	"stop",
	"start",
	"restart",
];

module.exports = async (ctx, next) => {
	if(!ctx.query.repo || !ctx.query.ref || !allowedAction.some(act => act === ctx.query.action)){
		return ctx.status = 400;
	}
	
	const target = await AppModel.find(ctx.token.admin ? null : ctx.token.name, ctx.query.repo, ctx.query.ref);
	if(!target){
		ctx.status = 403;
		ctx.body = "You cannot control this application.";
		return await next();
	}
	
	console.log(`----- ${target.repo} (${target.branch}) -----`);
	
	const app = new AppModel();
	await app.resolve(target.repo, target.branch);
	
	await utils.exec(`docker ${ctx.query.action} ${app.name}`);
	
	console.log(`[*] Finished ${ctx.query.action} ${target.repo} (${target.branch})`);
	
	ctx.status = 200;
	ctx.body = "OK";
	await next();
};
