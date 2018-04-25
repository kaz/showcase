"use strict";

const chalk = require("chalk");

let save = true;
const store = [];

const setMode = s => save = s;
const get = _ => store.join("\n");

const print = text => {
	console.log(text);
	if(save){
		store.push(text);
	}
};

const hr = message => print(chalk.blue(`---------- ${message} ----------`));

const inherit = e => e;
const printer = (header, hColor, mColor) => message => print(hColor(`[${header}]`) + " " + mColor(message));

const log = printer("*", chalk.bgGreen, chalk.green);
const shell = printer("<", chalk.bgCyan, chalk.cyan);
const stdout = printer(">", chalk.bgWhite, inherit);
const stderr = printer("#", chalk.bgYellow, chalk.yellow);
const exception = printer("!", chalk.bgRed, chalk.red);
const system = printer("+", chalk.bgMagenta, chalk.magenta);

module.exports = {setMode, get, hr, log, shell, stdout, stderr, exception, system};
