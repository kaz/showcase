"use strict";

const settings = require("../../settings");

module.exports = async conn => {
	const col = (await conn.mongo()).db(settings.name).collection("logs");
	
	const add = async (repo, log) => {
		await col.insertOne({repo, date: new Date, log});
	};
	const remove = async repo => {
		await col.deleteMany({repo});
	};
	
	return {add, remove};
};
