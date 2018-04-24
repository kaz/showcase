"use strict";

const AppModel = require("../model/app");

module.exports = async (ctx, next) => {
	if(!ctx.query.scope){
		return ctx.status = 400;
	}

	const mine = ctx.query.scope === "my";

	ctx.status = 200;
	ctx.body = (await AppModel.all(mine ? ctx.token.name : null)).map(app => app.document);

	if(!mine){
		for(const item of ctx.body){
			// TODO: filter information
		}
	}
};
