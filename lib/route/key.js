"use strict";

const utils = require("../helper/utils");
const settings = require("../../settings");

const Logger = require("../helper/logger");
const PubkeyModel = require("../model/pubkey");

module.exports = async ctx => {
	Logger.system("Updating public keys ...");

	try {
		await PubkeyModel.update(ctx.token.name);
		const keys = await PubkeyModel.authorized_keys();
		await utils.writeFile(settings.keyPath, keys, {mode: 0o600});
	} catch(e) {
		return ctx.status = 500;
	}

	Logger.system("Finished updating key");

	ctx.status = 200;
	ctx.body = "Updated";
};
