"use strict";

const AppModel = require("../model/app");

module.exports = async (ctx, next) => {
	if(!ctx.query.scope){
		return ctx.status = 400;
	}
	
	ctx.status = 200;
	ctx.body = await AppModel.apps(ctx.query.scope == "my" ? ctx.token.name : null)
	
	await next();
};
