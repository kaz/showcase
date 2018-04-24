"use strict";

const LogModel = require("../model/log");

module.exports = async (ctx, next) => {
	ctx.status = 200;
	ctx.body = await LogModel.getByUser(ctx.token.name);
};
