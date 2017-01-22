"use strict";

const path = require("path");

const settings = require("../../settings");

const utils = require("../helper/utils");
const Connector = require("../helper/connector");

class PubKey {
	static async __write(user, keys){
		const collection = await PubKey.__connect();
		await collection.deleteMany({user});
		if(keys.length){
			await collection.insertMany(keys.map(key => {
				return {user, key};
			}));
		}
	}
	static async __request(user){
		const data = await utils.request(`/api/v1/users/${user}/keys`);
		return data.map(item => item.key);
	}
	static async update(user){
		await PubKey.__write(user, await PubKey.__request(user));
	}
	
	static async authorized_keys(){
		const collection = await PubKey.__connect();
		const data = await collection.find({}).toArray();
		const modulePath = path.resolve(path.join(__dirname, "../shell.js"));
		return data.map(item => `command="${process.argv[0]} --harmony ${modulePath} ${item.user}",no-port-forwarding,no-X11-forwarding,no-agent-forwarding ${item.key}`).join("\n");
	}
	
	static async __connect(){
		return (await Connector.mongo()).db(settings.name).collection("pubkey");
	}
}

module.exports = PubKey;
