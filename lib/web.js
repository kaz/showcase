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
const env = require("./route/env");
const remove = require("./route/remove");
const status = require("./route/status");
const action = require("./route/action");
const update_key = require("./route/update_key");
const clients = require("./route/clients");

const app = new Koa();
app.use(rt.authorize);
app.use(route.get("/api/list", list));
app.use(route.get("/api/create", create));
app.use(route.get("/api/env", env));
app.use(route.get("/api/remove", remove));
app.use(route.get("/api/status", status));
app.use(route.get("/api/action", action));
app.use(route.get("/api/update_key", update_key));
app.use(route.get("/", clients.index));
app.use(route.get("/mycase", clients.mycase));
app.use(route.get("/allcase", clients.allcase));
app.use(route.get("/ssh", clients.ssh));
app.use(clients.staticFile);
app.use(clients.fallback);
app.use(rt.release);

app.listen(settings.listen);
