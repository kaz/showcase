"use strict";

const LogModel = require("../model/log");

module.exports = async ctx => {
	const {id, all} = ctx.query;
	const {name, admin} = ctx.token;

	ctx.status = 200;
	if(id){
		ctx.body = await LogModel.getById(id);
	}else if(all && admin){
		ctx.body = await LogModel.getAll();
	}else{
		ctx.body = await LogModel.getByUser(name);
	}
};
