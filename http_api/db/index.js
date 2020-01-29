
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

module.exports.findQuestion = async (isOpen, senderId, offset) => {
    let client = undefined;
    try {
        client = await pool.connect();
        
        const query = `
            SELECT trs51."id",
                   trs51."senderId",
                   trs51."timestamp",
                   (trs51."asset" -> 'quiz' ->> 'question') as question,
                   (trs51."asset" -> 'quiz' ->> 'reward')::INT as reward,
                   (trs51."asset" -> 'quiz' ->> 'num')::INT as num,
                   (SELECT count(*)
                      FROM trs as trs52
                     WHERE trs52."type" = 52
                       AND trs52."asset" ->> 'data' = trs51."id")::INT as answered
              FROM trs as trs51
             WHERE trs51."type" = 51
               AND (
                       (trs51."asset" -> 'quiz' ->> 'num')::INT ${isOpen? '>': '<='} (
                           SELECT count(*)
                            FROM trs as trs52
                           WHERE trs52."type" = 52
                             AND trs52."asset" ->> 'data' = trs51."id"
                       )
                       ${isOpen? 'AND NOT EXISTS': 'OR EXISTS'} (
                           SELECT 1 FROM trs WHERE trs."type" = 52 AND trs."senderId" = $1
                       )
                   )
            ORDER BY timestamp DESC
            LIMIT 100 OFFSET $2
        `;
        const result = await client.query(query, [senderId, offset]);
        return {success: true, data: result.rows}

    } catch(err) {
        console.log(err)
        return {success: false}

    } finally {
        client.release();
    }
}
