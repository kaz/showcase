"use strict";

const utils = require("../utils");
const Logger = require("../logger");
const settings = require("../../settings");

const idModel = require("../models/identities");

const type = "mariadb";

const check = config => config.use_mariadb;

module.exports.new = conn => {
	let database;
	let password;
	
	const get = repo => {
		return {
			repo,
			type,
			host: `mariadb.${settings.domain}`,
			data: database,
			user: "root",
			pass: password
		};
	};
	
	const create = async repo => {
		Logger.log("Creating mariadb user ...");
		
		const name = utils.repo2name(repo);
		const username = `root@'${name}.${settings.domain}'`;
		database = name.replace(".", "+");
		password = utils.randStr();
		
		// create maria user
		const maria = await conn.maria();
		await maria.queryAsync(`CREATE DATABASE \`${database}\``);
		await maria.queryAsync(`CREATE USER ${username} IDENTIFIED BY '${password}'`);
		await maria.queryAsync(`GRANT ALL ON \`${database}\`.* TO ${username}`);
		
		// save identities
		await (await idModel(conn)).add(get(repo));
	};
	const drop = async repo => {
		Logger.log("Dropping mariadb user ...");
		
		const name = utils.repo2name(repo);
		const username = `root@'${name}.${settings.domain}'`;
		database = name.replace(".", "+");
		
		// drop maria user
		const maria = await conn.maria();
		await maria.queryAsync(`DROP DATABASE \`${database}\``);
		await maria.queryAsync(`DROP USER ${username}`);
		
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
