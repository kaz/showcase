"use strict";

const Logger = require("../helper/logger");
const Deployer = require("../helper/deployer");
const Connector = require("../helper/connector");

const AppModel = require("../model/app");

module.exports = async ctx => {
	if(!ctx.query.repo || !ctx.query.ref){
		return ctx.status = 400;
	}
	
	const app = new AppModel();
	await app.resolve(ctx.query.repo, ctx.query.ref);
	
	await Deployer.run(app);
	
	Connector.close();
};
