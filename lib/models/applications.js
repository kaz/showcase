"use strict";

const settings = require("../../settings");

const request = path => new Promise((resolve, reject) => {
	const http = require(settings.api.protocol.substr(0, settings.api.protocol.length - 1));
	settings.api.path = path;
	http.get(settings.api, res => {
		if(res.statusCode !== 200){
			return reject(new Error("Invalid status code " + res.statusCode));
		}
		const data = [];
		res.on("data", chunk => data.push(chunk));
		res.on("end", _ => {
			if(data.length == 0){
				return reject(new Error("No response body"));
			}
			resolve(JSON.parse(Buffer.concat(data)));
		});
	});
});

const getNamespaces = async user => {
	try {
		const data = await request(`/api/v1/users/${user}/orgs`);
		const names = data.map(item => item.username);
		names.push(user);
		return names;
	} catch(e) {
		return [];
	}
};

module.exports = async conn => {
	const col = (await conn.mongo()).db(settings.name).collection("applications");
	
	const getApplications = async ns => {
		const filter = ns.map(item => new RegExp("^" + item));
		const apps = await col.find({repo: {$in: filter}}).toArray();
		return apps.map(item => {
			return {
				repo: item.repo,
				type: item.conf.type,
			};
		});
	};
	
	const getAccessable = async name => {
		return await getApplications(await getNamespaces(name));
	};
	
	const add = async (repo, conf) => {
		await remove(repo);
		await col.insertOne({repo, conf, date: new Date});
	};
	const remove = async repo => {
		await col.deleteMany({repo});
	};
	
	return {getAccessable, add, remove};
};
