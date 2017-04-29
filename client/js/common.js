"use strict";

const gitHost = "git.trapti.tech";
const pubDomain = ".trap.show";

const makeExposePrintable = expose => expose ? (Array.isArray(expose) ? expose : [expose]).map(e => `${e}/tcp`).join(", ") : "-";

const hostname = app => {
	const name = app.repo.split("/").reverse().join(".") + pubDomain;
	if(app.branch != "master"){
		return `${app.branch}.${name}`;
	}
	return name;
};

const sanitizeObject = data => {
	for(let key in data){
		if(typeof data[key] === "string"){
			data[key] = data[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}else if(typeof data[key] === "object"){
			data[key] = sanitizeObject(data[key]);
		}
	}
	return data;
};

const API = (api, param) => $.ajax({
	url: `/api/${api}`,
	data: param,
	xhrFields: {
		withCredentials: true
	}
}).then(data => sanitizeObject(data));
