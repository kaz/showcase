"use strict";

const jwt = require("jsonwebtoken");
const Promise = require("bluebird");

const Connector = require("../helper/connector");

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
		const verified = await verify(token, pubKey, {algorithms: "ES256"});
		
		ctx.token = {
			name: verified.id,
			git_hook: !!verified.git_hook,
			admin: verified.uid && (verified.uid <= 2),
		};
		
		if(ctx.token.git_hook){
			console.log("[*] Received git hook");
		}
		if(ctx.token.admin){
			console.log(`[*] Admin access (${ctx.token.name})`);	
		}
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

module.exports = {authorize, release};
