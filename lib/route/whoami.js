"use strict";

module.exports = async (ctx, next) => {
	ctx.status = 200;
	ctx.body = ctx.token.name;
};
