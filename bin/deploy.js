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
	const type = process.argv[2];
	if(!type){
		console.error("type not specified");
		return;
	}
	for(const app of await AppModel.apps()){
		if(new RegExp(type).test(app.config.type)){
			await deploy(app.repo, app.branch);
		}
	}
	Connector.close();
})();
