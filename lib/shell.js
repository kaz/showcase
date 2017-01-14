"use strict";

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
	apps.push(temporaryLabel);
	
	for(let i = 1; i <= apps.length; i++){
		console.log(`${i}) ${apps[i-1]}`);
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
	if(select == temporaryLabel){
		const name = "tmp-" + utils.randStr(10);
		args = `run -ti --rm --name ${name} --hostname ${name} --network ${settings.domain} --workdir /srv kazsw/arch bash`;
		killArgs = `stop ${name}`;
	}else{
		const name = utils.repo2name(select);
		args = `exec -ti ${name} bash`;
		killArgs = `restart ${name}`;
	}
	
	child_process.spawn("docker", args.split(" "), {stdio: "inherit"});
	
	const stop = _ => {
		child_process.spawn("docker", killArgs.split(" "));
		process.exit(0);
	};
	process.on("SIGINT", stop);
	process.on("SIGHUP", stop);
	process.on("SIGTERM", stop);
};

login("root");
