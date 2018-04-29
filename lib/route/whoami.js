"use strict";

module.exports = async ctx => {
	ctx.status = 200;
	ctx.body = ctx.token.name;
};
