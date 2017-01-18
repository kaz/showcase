"use strict";

const Koa = require("koa");
const route = require("koa-route");

const Deployer = require("./helper/deployer");
const settings = require("../settings");

const push = require("./route/push");

Deployer.setupNginxSystem().catch(err => {
	console.trace(err);
	process.exit(-1);
});

const app = new Koa();
app.use(route.get("/push", push));
app.listen(settings.listen);
