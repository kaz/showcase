"use strict";

module.exports = async ctx => {
	const envs = JSON.parse(ctx.query.set);
	if(typeof envs !== "object" || Array.isArray(envs)){
		ctx.body = "Invalid env json.";
		return ctx.status = 400;
	}

	const {app} = ctx.state;
	app.document.envs = envs;
	await app.save();

	ctx.status = 200;
	ctx.body = "OK (Re-deployment is required)";
};
