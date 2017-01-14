"use strict";

const settings = require("../../settings");

module.exports = async conn => {
	const col = (await conn.mongo()).db(settings.name).collection("identities");
	
	const add = async record => {
		await col.insertOne(record);
	};
	const remove = async (repo, type) => {
		await col.deleteMany({repo, type});
	};
	const get = async (repo, type) => {
		return await col.findOne({repo, type});
	};
	
	return {add, remove, get};
};
