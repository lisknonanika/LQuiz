
const { configDevnet } = require('../../config');
const { Pool } = require('pg');

const pool = new Pool({
    user: configDevnet.components.storage.user,
    host: configDevnet.components.storage.host,
    database: configDevnet.components.storage.database,
    password: configDevnet.components.storage.password,
    port: configDevnet.components.storage.port
});

module.exports.findAnswerSenderIdByTargetId = async (targetId) => {
    if (!targetId) return {success: false, err: 'TargetId is required'}

    let client = undefined;
    try {
        client = await pool.connect();
        const query = `
            SELECT trs."senderId"
              FROM trs
             WHERE trs."type" = 52
               AND trs."asset" ->> 'data' = $1
        `;
        const result = await client.query(query, [targetId]);
        return {success: true, data: result.rows}

    } catch(err) {
        console.log(err)
        return {success: false}

    } finally {
        client.release();
    }
}