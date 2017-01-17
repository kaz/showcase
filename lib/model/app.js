"use strict";

const settings = require("../../settings");

const utils = require("../helper/utils");
const Connector = require("../helper/connector");

class App {
	constructor(){
		this.collection = null;
		this.document = null;
	}
	async resolve(repo, branch){
		this.collection = await App.__connect();
		this.document = (await this.collection.findOne({repo, branch})) || {
			repo,
			branch,
			config: {},
			keys: {},
			logs: [],
			created: new Date,
			updated: new Date,
		};
	}
	get name(){
		const name = this.document.repo.split("/").reverse().join(".");
		if(this.document.branch != "master"){
			return `${this.document.branch}.${name}`;
		}
		return name;
	}
	get namespace(){
		return this.document.repo.split("/")[0];
	}
	get __filter(){
		return {repo: this.document.repo, branch: this.document.branch};
	}
	async save(){
		this.document.updated = new Date;
		await this.collection.replaceOne(this.__filter, this.document, {upsert: true});
	}
	async delete(){
		await this.collection.deleteOne(this.__filter);
	}
	
	static async __connect(){
		return (await Connector.mongo()).db(settings.name).collection("app");
	}
	
	static async __namespaces(user){
		try {
			const data = await utils.request(`/api/v1/users/${user}/orgs`);
			const names = data.map(item => item.username);
			names.push(user);
			return names;
		} catch(e) {
			console.trace(e);
			return [];
		}
	}
	static async apps(user){
		const col = await App.__connect();
		if(user){
			const filter = (await App.__namespaces(user)).map(item => new RegExp(`^${item}`));
			return await col.find({repo: {$in: filter}}).toArray();
		}else{
			return await col.find({}, {keys: false}).toArray();
		}
	}
};

module.exports = App;
