"use strict";

const mysql = require("mysql");
const mongodb = require("mongodb");
const Promise = require("bluebird");

const conf = {
	user: "root",
	password: ""
};

const connectMaria = async _ => {
	const connection = mysql.createConnection(conf);
	await Promise.promisify(connection.connect);
	return Promise.promisifyAll(connection);
};
const conenctMongo = async _ => {
	return await mongodb.MongoClient.connect(`mongodb://${conf.user}:${conf.password}@localhost/admin`);
};

module.exports.new = _ => {
	let maria_conn;
	let mongo_conn;
	
	const maria = async _ => maria_conn || (maria_conn = await connectMaria());
	const mongo = async _ => mongo_conn || (mongo_conn = await conenctMongo());
	
	const close = _ => {
		if(maria_conn){
			maria_conn.destroy();
			maria_conn = null;
		}
		if(mongo_conn){
			mongo_conn.close();
			mongo_conn = null;
		}
	}
	
	return {maria, mongo, close};
};
