"use strict";

const Koa = require("koa");
const route = require("koa-route");

const Manager = require("./helper/manager");
const settings = require("../settings");

const push = require("./route/push");
const pop = require("./route/pop");

Manager.setupNginxSystem().catch(err => {
	console.trace(err);
	process.exit(-1);
});

const app = new Koa();
app.use(route.get("/push", push));
app.use(route.get("/pop", pop));
app.listen(settings.listen);
