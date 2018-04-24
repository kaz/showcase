"use strict";

const path = require("path");

const settings = require("../../settings");
const Connector = require("../helper/connector");

module.exports = class Log {
	constructor(key){
		this.key = key;
	}

	async succeeded(log){
		await Promise.all([this.__dismiss(), this.__write("Succeeded", log)]);
	}
	async failed(log){
		await Promise.all([this.__dismiss(), this.__write("Failed", log)]);
	}
	async deploying(){
		await this.__write("Deploying", null);
	}
	async __dismiss(){
		await this.__delete("Deploying");
	}

	async __write(status, log){
		const collection = await Log.__connect();
		await collection.insertOne(Object.assign({status, log}, this.key));
	}
	async __delete(status){
		const collection = await Log.__connect();
		await collection.deleteMany(Object.assign({status}, this.key));
	}
	static async __connect(){
		return (await Connector.mongo()).db(settings.name).collection("log");
	}
};
