"use strict";

const path = require("path");
const child_process = require("child_process");

const utils = require("./helper/utils");
const Parser = require("./helper/parser");
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
		const app = new AppModel();
		await app.resolve(`${user}/temporary`, "master");
		
		const expose = Math.floor(Math.random() * 5536) + 60000;
		await Parser.parseConfig(app, "./resources/default.yaml");
		
		args = [
			"run", "-ti", "--rm",
			"--entrypoint", "bash",
			"--env", `SHOWCASE_EXPOSED_PORT=${expose}`,
			"--publish", `${expose}:${expose}`,
		].concat(Parser.dockerArg(app));
		killArgs = ["stop", app.name];
	}else{
		const app = new AppModel();
		await app.resolve(select.repo, select.branch);
		
		const status = await utils.getStatus(app);
		if(status === "running"){
			args = ["exec", "-ti", app.name, "bash"];
			killArgs = ["restart", app.name];
		}else{
			await utils.exec(`docker rm -f ${app.name}`).catch(_ => 0);
			args = [
				"run", "-ti", "--rm",
				"--entrypoint", "bash",
			].concat(Parser.dockerArg(app));
			killArgs = ["stop", app.name];
		}
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
	process.chdir(path.join(__dirname, ".."));
	await login(process.argv[2]);
	Connector.close();
})().catch(e => console.trace(e));
