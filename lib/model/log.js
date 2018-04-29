"use strict";

const {ObjectID} = require("mongodb");

const settings = require("../../settings");

const Namespace = require("../helper/namespace");
const Connector = require("../helper/connector");

module.exports = class Log {
	constructor(key){
		this.key = key;
	}

	async isDeploying(){
		return (await Log.__get(this.__deployingFilter, {_id: 1})).length > 0;
	}
	async get(){
		return await Log.__get(this.key, {_id: 1, status: 1, created: 1});
	}
	static async getByUser(user){
		return await Log.__get({repo: {$in: await Namespace.regexp(user)}}, {log: 0});
	}
	static async getById(id){
		return (await Log.__get({_id: ObjectID(id)})).pop();
	}

	async succeeded(log){
		await Promise.all([this.__dismiss(), this.__write("Succeeded", log)]);
	}
	async failed(log){
		await Promise.all([this.__dismiss(), this.__write("Failed", log)]);
	}
	async deploying(){
		await this.__write(this.__deployingFilter.status, null);
	}

	get __deployingFilter(){
		return Object.assign({status: "Deploying"}, this.key);
	}
	async __dismiss(){
		const collection = await Log.__connect();
		await collection.deleteMany(this.__deployingFilter);
	}
	async __write(status, log){
		const collection = await Log.__connect();
		await collection.insertOne(Object.assign({status, log, created: new Date}, this.key));
	}
	static async __get(filter, projection){
		const collection = await Log.__connect();
		return await collection.find(filter, {projection}).toArray();
	}
	static async __connect(){
		return (await Connector.mongo()).db(settings.name).collection("log");
	}
};
