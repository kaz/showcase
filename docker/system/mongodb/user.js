// mongo admin -u root -p root

db.createUser({
	user: "root",
	pwd: "root",
	roles: [{
		role: "userAdminAnyDatabase",
		db: "admin"
	}]
});

db.createUser({
	user: "traplus",
	pwd: "traplus",
	roles: [{
		role: "dbOwner",
		db: "traplus"
	}]
});
