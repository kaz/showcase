"use strict";

const path = require("path");

const settings = require("../../settings");

const utils = require("../helper/utils");
const Connector = require("../helper/connector");

const emptyStatus = Status => ({State: {Status}});

module.exports = class App {
	constructor(collection, document){
		this.collection = collection;
		this.document = document;
	}
	async addLog(status, log){
		this.document.logs.push({
			status,
			log,
			created: new Date,
		});
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

	async setStatus(msg){
		this.document.status = emptyStatus(msg);
		await this.save();
	}
	async updateStatus(){
		const {type} = this.document.config;
		if(!type || type === "static"){
			this.document.status = emptyStatus("static serving");
		}else{
			const stat = await utils.dockerInspect(this);
			if(stat){
				this.document.status = JSON.parse(stat)[0];
			}else{
				this.document.status = emptyStatus("unknown");
			}
		}
		await this.collection.updateOne(this.__filter, {$set: {status: this.document.status}});
	}

	get name(){
		const name = this.document.repo.split("/").reverse().join(".");
		if(this.document.branch != "master"){
			return `${this.document.branch}.${name}`.toLowerCase();
		}
		return name.toLowerCase();
	}
	get namespace(){
		return this.document.repo.split("/")[0];
	}
	get relativeRepoPath(){
		return path.join("data/repositories", this.document.repo, this.document.branch);
	}
	get repoPath(){
		return path.resolve(this.relativeRepoPath);
	}
	get clonePath(){
		return `${settings.git}${this.document.repo}.git`;
	}

	static async __connect(){
		return (await Connector.mongo()).db(settings.name).collection("app");
	}

	static async namespaces(user){
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
	static async all(user){
		const collection = await App.__connect();
		const documents = await collection.find(user ? {repo: {$in: (await App.namespaces(user)).map(item => new RegExp(`^${item}`))}} : {}).toArray();
		return documents.map(document => new App(collection, document));
	}
	static async one(user, mRepo, mBranch){
		return (await App.all(user)).find(({document: {repo, branch}}) => mRepo === repo && mBranch === branch);
	}
	static async new(repo, branch){
		return new App(await App.__connect(), {
			repo,
			branch,
			status: {},
			config: {},
			keys: {},
			envs: {},
			logs: [],
			created: new Date,
			updated: new Date,
		});
	}
};
