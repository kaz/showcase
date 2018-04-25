"use strict";

const utils = require("../helper/utils");
const settings = require("../../settings");

const PubkeyModel = require("../model/pubkey");

module.exports = async (ctx, next) => {
	console.log("[*] Updating public keys ...");

	await PubkeyModel.update(ctx.token.name);
	const keys = await PubkeyModel.authorized_keys();
	await utils.writeFile(settings.keyPath, keys, {mode: 0o600});

	console.log("[*] Finished updating key");

	ctx.status = 200;
	ctx.body = "Updated";
};
