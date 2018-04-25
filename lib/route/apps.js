"use strict";

const AppModel = require("../model/app");

module.exports = async (ctx, next) => {
	if(!ctx.query.scope){
		return ctx.status = 400;
	}

	ctx.status = 200;
	ctx.body = (await AppModel.all(ctx.query.scope === "my" ? ctx.token.name : null)).map(({document}) => ({
		repo: document.repo,
		branch: document.branch,
		config: document.config,
		status: document.status,
	}));
};
