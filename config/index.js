const genesisBlockDevnet = require("./genesis_block_devnet");
const configDevnet = require("./config_devnet");

module.exports = {
	configDevnet,
	genesisBlockDevnet
};

module.exports.api = {
	domain: "127.0.0.1",
	port: 3101
}

module.exports.client = {
	domain: "127.0.0.1",
	port: 3102
}

module.exports.liskapiurl = "http://127.0.0.1:4000";
