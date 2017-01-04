"use strict";

const deployer = require("./lib/deployer");

deployer("root/test").catch(error => console.trace(error));
