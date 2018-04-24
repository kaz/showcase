"use strict";

const jwt = require("jsonwebtoken");
const Promise = require("bluebird");

const AppModel = require("../model/app");
const Connector = require("../helper/connector");

const pubKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAraewUw7V1hiuSgUvkly9
X+tcIh0e/KKqeFnAo8WR3ez2tA0fGwM+P8sYKHIDQFX7ER0c+ecTiKpo/Zt/a6AO
gB/zHb8L4TWMr2G4q79S1gNw465/SEaGKR8hRkdnxJ6LXdDEhgrH2ZwIPzE0EVO1
eFrDms1jS3/QEyZCJ72oYbAErI85qJDF/y/iRgl04XBK6GLIW11gpf8KRRAh4vuh
g5/YhsWUdcX+uDVthEEEGOikSacKZMFGZNi8X8YVnRyWLf24QTJnTHEv+0EStNrH
HnxCPX0m79p7tBfFC2ha2OYfOtA+94ZfpZXUi2r6gJZ+dq9FWYyA0DkiYPUq9QMb
OQIDAQAB
-----END PUBLIC KEY-----
`.trim();

let timer;
const releaseConnection = async (ctx, next) => {
	clearTimeout(timer);
	await next();
	timer = setTimeout(_ => Connector.close(), 4096);
};

const ensureAuthorized = async (ctx, next) => {
	try {
		const token = ctx.cookies.get("traP_token");
		if(!token){
			throw new Error("No token");
		}

		const verify = Promise.promisify(jwt.verify);
		const verified = await verify(token, pubKey, {algorithms: "RS256"});

		ctx.token = {
			name: verified.id,
			git_hook: !!verified.git_hook,
			admin: verified.uid && (verified.uid <= 2),
		};

		if(ctx.token.git_hook){
			console.log("[*] Received git hook");
		}
	} catch(e) {
		console.trace(e);
		ctx.status = 401;
		return;
	}
	await next();
};

const ensureAppSpecified = async (ctx, next) => {
	if(!ctx.query.repo || !ctx.query.ref){
		return ctx.status = 400;
	}
	await next();
};
const ensureAppExists = async (ctx, next) => {
	ctx.state.app = await AppModel.one(ctx.token.admin ? null : ctx.token.name, ctx.query.repo, ctx.query.ref);
	if(!ctx.state.app){
		ctx.body = "You cannot control this application.";
		return ctx.status = 403;
	}
	await next();
};

module.exports = {releaseConnection, ensureAuthorized, ensureAppSpecified, ensureAppExists};
