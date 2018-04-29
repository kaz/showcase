"use strict";

const Promise = require("bluebird");
const child_process = require("child_process");

const settings = require("../../settings");

const __exec = Promise.promisify(child_process.exec);

const gateway = async () => {
	const stat = await __exec(`docker network inspect ${settings.domain}`);
	return JSON.parse(stat)[0].IPAM.Config[0].Gateway;
};
const inspect = async app => {
	return await __exec(`docker inspect ${app.name}`).catch(() => null);
};
const logs = async app => {
	return await __exec(`docker logs --tail 1024 ${app.name}`).catch(() => "failed to fetch");
};

module.exports = {gateway, inspect, logs};
