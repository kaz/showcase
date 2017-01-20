"use strict";

const utils = require("../helper/utils");
const settings = require("../../settings");

const PubkeyModel = require("../model/pubkey");

module.exports = async (ctx, next) => {
	if(!ctx.query.name){
		return ctx.status = 400;
	}
	
	if(("git_hook" in ctx.trapToken) && ctx.trapToken.git_hook){
		console.log("[*] Received git hook");
	}else if(ctx.query.name !== ctx.trapToken.id){
		ctx.status = 403;
		ctx.body = "You cannot modify other's keys.";
		return;
	}
	
	console.log("[*] Updating public keys ...");
	
	await PubkeyModel.update(ctx.query.name);
	const keys = await PubkeyModel.authorized_keys();
	await utils.writeFile(settings.keyPath, keys, {mode: 0o600});
	
	ctx.status = 200;
	ctx.body = "Updated";
	await next();
};
