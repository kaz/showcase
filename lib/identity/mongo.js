"use strict";

const randomstring = require("randomstring");

const utils = require("../utils");
const Logger = require("../logger");

const type = "mongodb";

const check = config => config.use_mongodb;

module.exports.new = conn => {
	let database;
	let password;
	
	const get = repo => {
		return {
			repo,
			type,
			host: "mongodb.tra.plus",
			data: database,
			user: "root",
			pass: password
		};
	};
	
	const create = async repo => {
		Logger.log("Creating mongodb user ...");
		
		const name = utils.repo2name(repo);
		database = name.replace(".", "+");
		password = randomstring.generate(32);
		
		// create mongo user
		const mongo = await conn.mongo();
		await mongo.db(database).addUser("root", password, {
			roles: [{
				db: database,
				role: "dbOwner"
			}]
		});
		
		// save identities
		await mongo.db("traplus").collection("identities").insertOne(get(repo));
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
		await mongo.db("traplus").collection("identities").deleteMany({repo, type});
	};
	
	const resolve = async repo => {
		const mongo = await conn.mongo();
		const doc = await mongo.db("traplus").collection("identities").findOne({repo, type});
		if(doc){
			database = doc.data;
			password = doc.pass;
			return true;
		}
		return false;
	};
	
	return {check, get, create, drop, resolve};
};
