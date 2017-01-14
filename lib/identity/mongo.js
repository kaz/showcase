"use strict";

const utils = require("../utils");
const Logger = require("../logger");
const settings = require("../../settings");

const idModel = require("../models/identities");

const type = "mongodb";

const check = config => config.use_mongodb;

module.exports.new = conn => {
	let database;
	let password;
	
	const get = repo => {
		return {
			repo,
			type,
			host: `mongodb.${settings.domain}`,
			data: database,
			user: "root",
			pass: password
		};
	};
	
	const create = async repo => {
		Logger.log("Creating mongodb user ...");
		
		const name = utils.repo2name(repo);
		database = name.replace(".", "+");
		password = utils.randStr();
		
		// create mongo user
		const mongo = await conn.mongo();
		await mongo.db(database).addUser("root", password, {
			roles: [{
				db: database,
				role: "dbOwner"
			}]
		});
		
		// save identities
		await (await idModel(conn)).add(get(repo));
	};
	const drop = async repo => {
		Logger.log("Dropping mongodb user ...");
		
		const name = utils.repo2name(repo);
		database = name.replace(".", "+");
		
		// drop mongo user
		const mongo = await conn.mongo();
		await mongo.db(database).removeUser("root");
		await mongo.db(database).dropDatabase();
		
		// remove identities
		await (await idModel(conn)).add(repo, type);
	};
	
	const resolve = async repo => {
		const doc = await (await idModel(conn)).get(repo, type);
		if(doc){
			database = doc.data;
			password = doc.pass;
			return true;
		}
		return false;
	};
	
	return {check, get, create, drop, resolve};
};
