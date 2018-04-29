"use strict";

const path = require("path");

const settings = require("../../settings");

const Docker = require("../helper/docker");
const Namespace = require("../helper/namespace");
const Connector = require("../helper/connector");
const Log = require("../model/log");

const emptyStatus = Status => ({Status});

module.exports = class App {
	constructor(collection, document){
		this.collection = collection;
		this.document = document;
	}

	get log(){
		return new Log(this.__filter);
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

	async updateStatus(){
		const {type} = this.document.config;
		if(await this.log.isDeploying()){
			this.document.status = emptyStatus("deploying");
		}else if(!type || type === "static"){
			this.document.status = emptyStatus("static");
		}else{
			const stat = await Docker.inspect(this);
			this.document.status = stat ? JSON.parse(stat)[0].State : emptyStatus("unknown");
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

	static async all(user){
		const collection = await App.__connect();
		const documents = await collection.find(user ? {repo: {$in: await Namespace.regexp(user)}} : {}).toArray();
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
			created: new Date,
			updated: new Date,
		});
	}

	static async __connect(){
		return (await Connector.mongo()).db(settings.name).collection("app");
	}
};
