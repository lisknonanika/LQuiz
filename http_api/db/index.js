
const { configDevnet } = require('../../config');
const { Pool } = require('pg');

const pool = new Pool({
    user: configDevnet.components.storage.user,
    host: configDevnet.components.storage.host,
    database: configDevnet.components.storage.database,
    password: configDevnet.components.storage.password,
    port: configDevnet.components.storage.port
});

module.exports.findAnswerByTargetId = async (targetId) => {
    if (!targetId) return {success: false, err: 'TargetId is required'}

    let client = undefined;
    try {
        client = await pool.connect();
        const query = `
            SELECT trs."id", trs."senderId"
              FROM trs
             WHERE trs."type" = 52
               AND trs."asset" ->> "data" = $1
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

module.exports.findQuestion = async (isOpen, params) => {
    let client = undefined;
    try {
        // set senderId (default 0L)
        const senderId = params.senderId? params.senderId: '0L';
        
        // set offset (default 0)
        const offset = params.offset? params.offset: 0;
        
        // set sortKey (timestamp or num or reward. default timestamp)
        let sortKey = 'timestamp';
        if (!params.sortKey || params.sortKey.toUpperCase == "TIMESTAMP") {
            sortKey = 'timestamp';
        } else if (params.sortKey.toUpperCase == "NUM") {
            sortKey = 'trs51."asset" -> "quiz" ->> "num"';
        } else if (params.sortKey.toUpperCase == "REWARD") {
            sortKey = 'trs51."asset" -> "quiz" ->> "reward"';
        }
        
        // set sortType (0: DESC, 1: ASC)
        const sortType = params.sortType? "DESC": "ASC";
        
        client = await pool.connect();
        
        const query = `
            SELECT trs51."id",
                   trs51."senderId",
                   trs51."timestamp",
                   (trs51."asset" -> "quiz" ->> "question") as question,
                   (trs51."asset" -> "quiz" ->> "reward")::INT as reward,
                   (trs51."asset" -> "quiz" ->> "num")::INT as num,
                   (SELECT count(*)
                      FROM trs as trs52
                     WHERE trs52."type" = 52
                       AND trs52."asset" ->> "data" = trs51."id")::INT as answered
              FROM trs as trs51
             WHERE trs51."type" = 51
               AND (
                       (trs51."asset" -> "quiz" ->> "num")::INT ${isOpen? ">": "<="} (
                           SELECT count(*)
                            FROM trs as trs52
                           WHERE trs52."type" = 52
                             AND trs52."asset" ->> "data" = trs51."id"
                       )
                       ${isOpen? "AND NOT EXISTS": "OR EXISTS"} (
                           SELECT 1 FROM trs WHERE trs."type" = 52 AND trs."senderId" = $1
                       )
                   )
            ORDER BY ${sortKey} ${sortType}
            LIMIT 100 OFFSET ${offset}
        `;
        const result = await client.query(query, [senderId]);
        return {success: true, data: result.rows}

    } catch(err) {
        console.log(err)
        return {success: false}

    } finally {
        client.release();
    }
}
