"use strict";

const randomstring = require("randomstring");

class Key {
	constructor(app, type){
		this.app = app;
		this.type = type;
	}
	needed(config){
		return config[`use_${this_type}`];
	}
	get newKey(){
		return {name: this.app.name, password: randomstring.generate(32)};
	}
	get key(){
		return this.app.document.keys[this.type];
	}
	set key(val){
		this.app.document.keys[this.type] = val;
	}
}

module.exports = Key;
