
const { configDevnet } = require('../../config');
const { Client } = require('pg');

const pgClient = new Client({
    user: configDevnet.components.storage.user,
    host: configDevnet.components.storage.host,
    database: configDevnet.components.storage.database,
    password: configDevnet.components.storage.password,
    port: configDevnet.components.storage.port
});

