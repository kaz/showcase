"use strict";

module.exports = async (ctx, next) => {
	const envs = JSON.parse(ctx.query.envs);
	if(typeof envs !== "object" || Array.isArray(envs)){
		ctx.status = 400;
		ctx.body = "Invalid env json.";
		return await next();
	}

	const {app} = ctx.state;
	app.document.envs = envs;
	await app.save();

	ctx.status = 200;
	ctx.body = app.document;

	await next();
};
