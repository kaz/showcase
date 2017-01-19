"use strict";

const Koa = require("koa");
const route = require("koa-route");
const jwt = require("jsonwebtoken");
const Promise = require("bluebird");

const Manager = require("./helper/manager");
const Connector = require("./helper/connector");
const settings = require("../settings");

Manager.setupNginxSystem().catch(err => {
	console.trace(err);
	process.exit(-1);
});

const pubKey = `
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEs5hiXIs6lDhdNzRRGKBY1gyU+bTz
c9ZsIvPn2CcPj8j9z0jbXtpqRJjhX8EIo+bL1bzPnOEGXcOsk2a/bmwEzA==
-----END PUBLIC KEY-----
`.trim();

const authorize = async (ctx, next) => {
	try {
		const token = ctx.cookies.get("traP_token");
		if(!token){
			throw new Error("No token");
		}
		
		const verify = Promise.promisify(jwt.verify);
		ctx.trapToken = await verify(token, pubKey, {algorithms: "ES256"});
	} catch(e) {
		console.trace(e);
		ctx.status = 401;
		return;
	}
	await next();
};
const release = async _ => {
	Connector.close();
};

const create = require("./route/create");
const remove = require("./route/remove");
const status = require("./route/status");
const action = require("./route/action");
const update_key = require("./route/update_key");

const app = new Koa();
app.use(authorize);
app.use(route.get("/create", create));
app.use(route.get("/remove", remove));
app.use(route.get("/status", status));
app.use(route.get("/action", action));
app.use(route.get("/update_key", update_key));
app.use(release);

app.listen(settings.listen);
