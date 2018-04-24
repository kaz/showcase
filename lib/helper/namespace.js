"use strict";

const utils = require("./utils");

const get = async user => {
	try {
		const data = await utils.request(`/api/v1/users/${user}/orgs`);
		return [user].concat(data.map(item => item.username));
	} catch(e) {
		console.trace(e);
		return [];
	}
};

const regexp = async user => (await get(user)).map(item => new RegExp(`^${item}/`));
const contained = async (user, needle) => (await get(user)).some(item => item === needle);

module.exports = {get, regexp, contained};
