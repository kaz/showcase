"use strict";

const AppModel = require("../model/app");

module.exports = async (ctx, next) => {
	if(!ctx.query.repo || !ctx.query.ref){
		return ctx.status = 400;
	}

	const envs = JSON.parse(ctx.query.envs);
	if(typeof envs !== "object" || Array.isArray(envs)){
		ctx.status = 400;
		ctx.body = "Invalid env json.";
		return await next();
	}

	const target = await AppModel.find(ctx.token.admin ? null : ctx.token.name, ctx.query.repo, ctx.query.ref);
	if(!target){
		ctx.status = 403;
		ctx.body = "You cannot modify this application.";
		return await next();
	}

	const app = new AppModel();
	await app.resolve(target.repo, target.branch);

	app.document.envs = envs;
	await app.save();

	ctx.status = 200;
	ctx.body = app.document;
	await next();
};
