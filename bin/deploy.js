"use strict";

const path = require("path");
const child_process = require("child_process");

const AppModel = require("../lib/model/app");
const Connector = require("../lib/helper/connector");

const deploy = (repo, ref) => new Promise(resolve => {
	console.log(`Deploying ${repo} (${ref}) ...`);
	
	const modulePath = path.resolve(path.join(__dirname, "../lib/worker/deploy"));
	const child = child_process.fork(modulePath, [ctx.query.repo, ctx.query.ref], {cwd: process.cwd()});
	
	child.on("exit", resolve);
});

(async _ => {
	for(const app of await AppModel.apps()){
		await deploy(app.repo, app.branch);
	}
	Connector.close();
})();
