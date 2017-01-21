"use strict";

const Connector = require("../helper/connector");
const settings = require("../../settings");

const Key = require("./");

class MariaKey extends Key {
	constructor(app){
		super(app, "mariadb");
	}
	get newKey(){
		const key = super.newKey;
		key.database = key.name.replace(/\./g, "+");
		key.username = `root@'${key.name}.${settings.domain}'`;
		return key;
	}
	async create(){
		const {username, password, database} = this.newKey;
		
		const maria = await Connector.maria();
		await maria.queryAsync(`CREATE DATABASE \`${database}\``);
		await maria.queryAsync(`CREATE USER ${username} IDENTIFIED BY '${password}'`);
		await maria.queryAsync(`GRANT ALL ON \`${database}\`.* TO ${username}`);
		
		this.key = {
			username,
			password,
			database,
			hostname: `${this.type}.${settings.domain}`,
		};
	}
	async drop(){
		const {username, database} = this.newKey;
		
		const maria = await Connector.maria();
		await maria.queryAsync(`DROP DATABASE \`${database}\``);
		await maria.queryAsync(`DROP USER ${username}`);
		
		this.key = undefined;
	}
}

module.exports = MariaKey;
