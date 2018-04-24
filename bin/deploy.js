"use strict";

const path = require("path");
const child_process = require("child_process");

const AppModel = require("../lib/model/app");
const Connector = require("../lib/helper/connector");

const deploy = (repo, ref) => new Promise(resolve => {
	console.log(`Deploying ${repo} (${ref}) ...`);

	const modulePath = path.resolve(path.join(__dirname, "../lib/worker/deploy"));
	const child = child_process.fork(modulePath, [repo, ref], {cwd: process.cwd()});

	child.on("exit", resolve);
});

(async _ => {
	const typeRE = process.argv[2];
	if(!typeRE){
		console.error("type not specified");
		return;
	}
	for(const {document: {repo, branch, config: type}} of await AppModel.all()){
		if(new RegExp(typeRE).test(type)){
			await deploy(repo, branch);
		}
	}
	Connector.close();
})();
