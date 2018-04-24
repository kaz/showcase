"use strict";

const Koa = require("koa");
const path = require("path");
const route = require("koa-route");
const child_process = require("child_process");

const Manager = require("./helper/manager");
const settings = require("../settings");

Manager.setupNginx().catch(err => {
	console.trace(err);
	process.exit(-1);
});

const statusUpdator = _ => {
	const modulePath = path.resolve(path.join(__dirname, "./worker/status"));
	const worker = child_process.fork(modulePath, {cwd: process.cwd()});
	worker.on("exit", _ => setTimeout(statusUpdator, 5 * 60 * 1000));
};
statusUpdator();

const rt = require("./route");
const log = require("./route/log");
const env = require("./route/env");
const list = require("./route/list");
const create = require("./route/create");
const remove = require("./route/remove");
const action = require("./route/action");
const clients = require("./route/clients");
const update_key = require("./route/update_key");

const app = new Koa();

app.use(rt.ensureAuthorized);
app.use(route.get("/", clients.index));
app.use(route.get("/mycase", clients.mycase));
app.use(route.get("/allcase", clients.allcase));
app.use(route.get("/ssh", clients.ssh));
app.use(clients.staticFile);
app.use(clients.fallback);

app.use(rt.releaseConnection);
app.use(route.get("/api/list", list));
app.use(route.get("/api/log/my", log.my));
app.use(route.get("/api/update_key", update_key));

app.use(rt.ensureAppSpecified);
app.use(route.get("/api/create", create));

app.use(rt.ensureAppExists);
app.use(route.get("/api/env", env));
app.use(route.get("/api/log", log.index));
app.use(route.get("/api/remove", remove));
app.use(route.get("/api/action", action));

app.listen(settings.listen);
