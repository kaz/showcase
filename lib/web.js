"use strict";

const Koa = require("koa");
const route = require("koa-route");

const Manager = require("./helper/manager");
const settings = require("../settings");

Manager.setupNginx().catch(err => {
	console.trace(err);
	process.exit(-1);
});

const rt = require("./route");
const list = require("./route/list");
const create = require("./route/create");
const remove = require("./route/remove");
const status = require("./route/status");
const action = require("./route/action");
const update_key = require("./route/update_key");

const app = new Koa();
app.use(rt.authorize);
app.use(route.get("/list", list));
app.use(route.get("/create", create));
app.use(route.get("/remove", remove));
app.use(route.get("/status", status));
app.use(route.get("/action", action));
app.use(route.get("/update_key", update_key));
app.use(rt.release);

app.listen(settings.listen);
