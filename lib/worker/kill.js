"use strict";

const isRunning = require("is-running");
const child_process = require("child_process");

const data = JSON.parse(process.argv[2]);

const tick = _ => {
	if(!isRunning(data.pid)){
		child_process.spawn("docker", data.args);
	}else{
		setTimeout(tick, 1000);
	}
};
tick();
