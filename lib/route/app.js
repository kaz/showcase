"use strict";

const Docker = require("../helper/docker");

module.exports = async ctx => {
	const {app} = ctx.state;
	const {renew, stdout} = ctx.query;

	if(renew){
		await app.updateStatus();
	}
	if(stdout){
		app.document.stdout = await Docker.logs(app);
	}
	app.document.logs = await app.log.get();

	ctx.status = 200;
	ctx.body = app.document;
};
