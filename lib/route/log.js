"use strict";

const LogModel = require("../model/log");

module.exports = async (ctx, next) => {
	const {id} = ctx.query;

	ctx.status = 200;
	ctx.body = await (id ? LogModel.getById(id) : LogModel.getByUser(ctx.token.name));
};
