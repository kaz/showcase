"use strict";

const randomstring = require("randomstring");

const pkg = require("../../package");
const utils = require("../utils");
const Logger = require("../logger");

const type = "mariadb";

const check = config => config.use_mariadb;

module.exports.new = conn => {
	let database;
	let password;
	
	const get = repo => {
		return {
			repo,
			type,
			host: `mariadb.${pkg.domain}`,
			data: database,
			user: "root",
			pass: password
		};
	};
	
	const create = async repo => {
		Logger.log("Creating mariadb user ...");
		
		const name = utils.repo2name(repo);
		const username = `root@'${name}.${pkg.domain}'`;
		database = name.replace(".", "+");
		password = randomstring.generate(32);
		
		// create maria user
		const maria = await conn.maria();
		await maria.queryAsync(`CREATE DATABASE \`${database}\``);
		await maria.queryAsync(`CREATE USER ${username} IDENTIFIED BY '${password}'`);
		await maria.queryAsync(`GRANT ALL ON \`${database}\`.* TO ${username}`);
		
		// save identities
		const mongo = await conn.mongo();
		await mongo.db(pkg.name).collection("identities").insertOne(get(repo));
	};
	const drop = async repo => {
		Logger.log("Dropping mariadb user ...");
		
		const name = utils.repo2name(repo);
		const username = `root@'${name}.${pkg.domain}'`;
		database = name.replace(".", "+");
		
		// drop maria user
		const maria = await conn.maria();
		await maria.queryAsync(`DROP DATABASE \`${database}\``);
		await maria.queryAsync(`DROP USER ${username}`);
		
		// remove identities
		const mongo = await conn.mongo();
		await mongo.db(pkg.name).collection("identities").deleteMany({repo, type});
	};
	
	const resolve = async repo => {
		const mongo = await conn.mongo();
		const doc = await mongo.db(pkg.name).collection("identities").findOne({repo, type});
		if(doc){
			database = doc.data;
			password = doc.pass;
			return true;
		}
		return false;
	};
	
	return {check, get, create, drop, resolve};
};
