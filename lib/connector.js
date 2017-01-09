"use strict";

const mysql = require("mysql");
const mongodb = require("mongodb");
const Promise = require("bluebird");

const maria = async _ => {
	const connection = mysql.createConnection({
		user: "root",
		password: ""
	});
	await Promise.promisify(connection.connect);
	return connection;
};
const mongo = async _ => {
	return await mongodb.MongoClient.connect("mongodb://root:root@localhost/admin");
};

// WIPz