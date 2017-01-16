"use strict";

const path = require("path");
const child_process = require("child_process");

const utils = require("./utils");
const settings = require("../settings");
const connector = require("./connector");

const appModel = require("./models/applications");

const motd = `               __             ____               
              / /__________ _/ __ \\              
             / __/ ___/ __ \`/ /_/ /              
   _____ __ / /_/ /  / /_/ / ____/_              
  / ___// /_\\__/_/ _ \\__,_/_/ ____/___ _________ 
  \\__ \\/ __ \\/ __ \\ | /| / / /   / __ \`/ ___/ _ \\
 ___/ / / / / /_/ / |/ |/ / /___/ /_/ (__  )  __/
/____/_/ /_/\\____/|__/|__/\\____/\\__,_/____/\\___/ 
`;


const login = async username => {
	console.log(motd);
	console.log("Welcome, root!");
	console.log("Which application to login?\n");
	
	const conn = connector.new();
	const apps = await (await appModel(conn)).getAccessable(username);
	conn.close();
	
	const temporaryLabel = "[Temporary container]";
	apps.push({repo: temporaryLabel});
	
	for(let i = 1; i <= apps.length; i++){
		console.log(`${i}) ${apps[i-1].repo}`);
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
		const name = `${username}.tmp`;
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
	}else if(select.type == "static"){
		const name = utils.repo2name(select.repo);
		const repoPath = path.resolve(path.join("./data/repositories", select.repo));
		args = [
			"run", "-ti", "--rm",
			"--name", name,
			"--hostname", name,
			"--volume", `${repoPath}:/srv`,
			"--network", settings.domain,
			"--workdir", "/srv",
			"kazsw/arch",
			"bash"
		];
		killArgs = ["stop", name];
	}else if(select.type == "runtime"){
		const name = utils.repo2name(select.repo);
		args = ["exec", "-ti", name, "bash"];
		killArgs = ["restart", name];
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

login("root").catch(e => console.trace(e));
