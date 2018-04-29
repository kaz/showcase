"use strict";

const Koa = require("koa");
const path = require("path");
const route = require("koa-route");
const cache = require("koa-static-cache");
const child_process = require("child_process");

const Logger = require("./helper/logger");
const Manager = require("./helper/manager");
const settings = require("../settings");

Logger.setMode(false);
Manager.setupNginx().catch(err => {
	console.trace(err);
	process.exit(-1);
});

const statusUpdator = () => {
	const modulePath = path.resolve(path.join(__dirname, "./worker/status"));
	const worker = child_process.fork(modulePath, {cwd: process.cwd()});
	worker.on("exit", () => setTimeout(statusUpdator, 5 * 60 * 1000));
};
statusUpdator();

const mw = require("./route");
const app = new Koa();

app.use(mw.ensureAuthorized);
app.use(cache("./ui/dist", {alias: {"/": "/index.html"}}));

app.use(mw.releaseConnection);
app.use(route.get("/api/log", require("./route/log")));
app.use(route.get("/api/key", require("./route/key")));
app.use(route.get("/api/apps", require("./route/apps")));
app.use(route.get("/api/whoami", require("./route/whoami")));

app.use(mw.ensureAppSpecified);
app.use(route.get("/api/create", require("./route/create")));

app.use(mw.ensureAppExists);
app.use(route.get("/api/app", require("./route/app")));
app.use(route.get("/api/env", require("./route/env")));
app.use(route.get("/api/remove", require("./route/remove")));
app.use(route.get("/api/action", require("./route/action")));

app.listen(settings.listen);
