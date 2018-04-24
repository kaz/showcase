"use strict";

const utils = require("../helper/utils");

module.exports = async (ctx, next) => {
	const {app} = ctx.state;

	app.document.status = app.isStatic ? "serving" : await utils.getStatus(app);
	app.document.stdout = app.isStatic ? "no stdout for static app" : await utils.getLog(app);

	ctx.status = 200;
	ctx.body = app.document;
};
