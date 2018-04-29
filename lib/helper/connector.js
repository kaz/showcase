"use strict";

const mysql = require("mysql");
const mongodb = require("mongodb");
const Promise = require("bluebird");

const conf = {
	user: "root",
	password: "",
};

let maria_conn;
const maria = async () => maria_conn || (maria_conn = await __maria());
const __maria = async () => {
	const connection = Promise.promisifyAll(mysql.createConnection(conf));
	await connection.connectAsync();
	return connection;
};

let mongo_conn;
const mongo = async () => mongo_conn || (mongo_conn = await __mongo());
const __mongo = async () => {
	return await mongodb.MongoClient.connect(`mongodb://${conf.user}:${conf.password}@localhost/admin`);
};

const close = () => {
	if(maria_conn){
		maria_conn.destroy();
		maria_conn = null;
	}
	if(mongo_conn){
		mongo_conn.close();
		mongo_conn = null;
	}
};

module.exports = {maria, mongo, close};
