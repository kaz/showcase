"use strict";

const Connector = require("../connector");
const settings = require("../../settings");

const Key = require("./");

class MongoKey extends Key {
	constructor(app){
		super(app, "mongo");
	}
	get newKey(){
		const key = super.newKey;
		key.database = key.name.replace(/\./g, "+");
		key.username = "root";
		return key;
	}
	async create(){
		const {username, password, database} = this.newKey;
		
		const mongo = await Connector.mongo();
		await mongo.db(database).addUser(username, password, {
			roles: [{
				db: database,
				role: "dbOwner"
			}]
		});
		
		this.key = {
			username,
			password,
			database,
			hostname: `${this.type}.${settings.domain}`,
		};
	}
	async drop(){
		const {username, database} = this.newKey;
		
		const mongo = await Connector.mongo();
		await mongo.db(database).removeUser(username);
		await mongo.db(database).dropDatabase();
		
		this.key = undefined;
	}
}

module.exports = MongoKey;
