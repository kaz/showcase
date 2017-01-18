"use strict";

const jwt = require("jsonwebtoken");
const Promise = require("bluebird");

const pubKey = `
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEs5hiXIs6lDhdNzRRGKBY1gyU+bTz
c9ZsIvPn2CcPj8j9z0jbXtpqRJjhX8EIo+bL1bzPnOEGXcOsk2a/bmwEzA==
-----END PUBLIC KEY-----
`.trim();

module.exports = async ctx => {
	try {
		const token = ctx.cookies.get("traP_token");
		if(!token){
			throw new Error("No token");
		}
		
		const verify = Promise.promisify(jwt.verify);
		return await verify(token, pubKey, {algorithms: "ES256"});
	} catch(e) {
		ctx.redirect("https://q.trapti.tech/?redirect=" + encodeURIComponent(ctx.origin));
		return null;
	}
};
