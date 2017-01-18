"use strict";

const path = require("path");
const child_process = require("child_process");

const utils = require("./helper/utils");
const Connector = require("./helper/connector");
const settings = require("../settings");

const AppModel = require("./model/app");

const motd = `               __             ____               
              / /__________ _/ __ \\              
             / __/ ___/ __ \`/ /_/ /              
   _____ __ / /_/ /  / /_/ / ____/_              
  / ___// /_\\__/_/ _ \\__,_/_/ ____/___ _________ 
  \\__ \\/ __ \\/ __ \\ | /| / / /   / __ \`/ ___/ _ \\
 ___/ / / / / /_/ / |/ |/ / /___/ /_/ (__  )  __/
/____/_/ /_/\\____/|__/|__/\\____/\\__,_/____/\\___/ 
`;

const login = async user => {
	if(!user){
		return;
	}
	
	console.log(motd);
	console.log(`Welcome, ${user}!`);
	console.log("Which application to login?\n");
	
	const apps = await AppModel.apps(user);
	
	const temporaryLabel = "TEMPORARY";
	apps.push({repo: temporaryLabel, branch: temporaryLabel});
	
	for(let i = 1; i <= apps.length; i++){
		console.log(`${i}) ${apps[i-1].repo} (${apps[i-1].branch})`);
	}
	console.log(`0) exit`);
	
	const selectNum = await utils.question("\nSelect: ");
	const select = apps[selectNum - 1];
	
	if(!select){
		console.log("Bye!");
		return;
	}
	
	console.log("\nEntering container ...\n");
	
	let args, killArgs;
	if(select.repo == temporaryLabel){
		const name = `${user}-tmp.api`;
		args = [
			"run", "-ti", "--rm",
			"--name", name,
			"--hostname", name,
			"--network", settings.domain,
			"--workdir", "/srv",
			"kazsw/arch",
			"bash"
		];
		killArgs = ["stop", name];
	}else if(select.config.type == "static"){
		const app = new AppModel();
		await app.resolve(select.repo, select.branch);
		args = [
			"run", "-ti", "--rm",
			"--name", app.name,
			"--hostname", app.name,
			"--volume", `${app.repoPath}:/srv`,
			"--network", settings.domain,
			"--workdir", "/srv",
			"kazsw/arch",
			"bash"
		];
		killArgs = ["stop", name];
	}else if(select.config.type == "runtime"){
		const app = new AppModel();
		await app.resolve(select.repo, select.branch);
		args = ["exec", "-ti", app.name, "bash"];
		killArgs = ["restart", app.name];
	}else{
		throw new Error("Invalid app type");
	}
	
	child_process.spawn("docker", args, {stdio: "inherit"});
	
	const stop = _ => {
		child_process.spawn("docker", killArgs);
		process.exit(0);
	};
	process.on("SIGINT", stop);
	process.on("SIGHUP", stop);
	process.on("SIGTERM", stop);
};

(async _ => {
	await login(process.argv[2]);
	Connector.close();
})().catch(e => console.trace(e));
