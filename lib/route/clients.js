"use strict";

const fs = require("fs");
const ejs = require("ejs");
const Promise = require("bluebird");
const staticCache = require("koa-static-cache");

const pkg = require("../../package.json");

Promise.promisifyAll(ejs);

const _getCfg = (ctx, title) => ({
	title,
	userName: ctx.token.name,
	version: pkg.version
});

const index = async ctx => {
	ctx.body = await ejs.renderFileAsync("./client/index.html", _getCfg(ctx, "Status"));
};
const mycase = async ctx => {
	ctx.body = await ejs.renderFileAsync("./client/mycase.html", _getCfg(ctx, "My Showcase"));
};
const allcase = async ctx => {
	ctx.body = await ejs.renderFileAsync("./client/allcase.html", _getCfg(ctx, "All Showcase"));
};
const ssh = async ctx => {
	ctx.body = await ejs.renderFileAsync("./client/ssh.html", _getCfg(ctx, "SSH Keys"));
};

const staticFile = staticCache("./client", {prefix: "/"});
const fallback = async (ctx, next) => {
	const m = ctx.path.match(/\/min\/[^\/]+\.(js|css)$/);
	if(m){
		ctx.type = m[1] == "js" ? "text/javascript" : "text/css";
		ctx.body = fs.createReadStream("./client" + ctx.path.replace("/min/", "/"));
	}else{
		await next();
	}
};

module.exports = {index, mycase, allcase, ssh, staticFile, fallback};
