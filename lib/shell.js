"use strict";

/* eslint-disable no-console */

const path = require("path");
const child_process = require("child_process");

const utils = require("./helper/utils");
const Parser = require("./helper/parser");
const Connector = require("./helper/connector");

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
		console.log("No user specified!");
		return;
	}

	console.log(motd);
	console.log(`Welcome, ${user}!`);
	console.log("Which application to login?\n");

	const apps = (await AppModel.all(user)).map(app => app.document);

	const temporaryLabel = "TEMPORARY";
	apps.push({repo: temporaryLabel, branch: temporaryLabel});

	for(let i = 1; i <= apps.length; i++){
		console.log(`${i}) ${apps[i-1].repo} (${apps[i-1].branch})`);
	}
	console.log("0) exit");

	const selectNum = await utils.question("\nSelect: ");
	const select = apps[selectNum - 1];

	if(!select){
		console.log("Bye!");
		return;
	}

	let args, killArgs;
	if(select.repo == temporaryLabel){
		const app = await AppModel.new(`${user}/temporary`, "master");

		const expose = Math.floor(Math.random() * 5536) + 60000;
		await Parser.parseConfig(app, "./resources/default.yaml");

		args = [
			"run", "-i",
			"--env", `SHOWCASE_EXPOSED_PORT=${expose}`,
			"--publish", `${expose}:${expose}`,
		].concat(Parser.dockerArg(app));
		killArgs = ["rm", "-f", app.name];
	}else{
		const app = await AppModel.one(user, select.repo, select.branch);

		if(app.document.status.Status === "running"){
			console.log();
			console.log("1) Launch shell");
			console.log("2) Attach to main process");

			if(/^2/i.test(await utils.question("\nSelect: "))){
				args = ["logs", "-f", app.name];
			}else{
				args = ["exec", "-ti", app.name, "bash"];
			}
			killArgs = ["restart", app.name];
		}else{
			await utils.exec(`docker rm -f ${app.name}`).catch(() => 0);
			args = ["run", "-i"].concat(Parser.dockerArg(app));
			killArgs = ["rm", "-f", app.name];
		}
	}

	console.log("\nEntering container ...\n");

	const modulePath = path.resolve(path.join(__dirname, "worker/kill"));
	const killData = JSON.stringify({
		pid: process.pid,
		args: killArgs,
	});

	child_process.spawn("node", [modulePath, killData], {detached: true, stdio: "ignore"});
	const shell = child_process.spawn("docker", args, {detached: true, stdio: "inherit"});
	shell.on("exit", () => process.exit());
};

(async () => {
	process.chdir(path.join(__dirname, ".."));
	await login(process.argv[2]);
	Connector.close();
})().catch(e => console.trace(e));
