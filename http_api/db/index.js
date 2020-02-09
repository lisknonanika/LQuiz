
const { configDevnet } = require("../../config");
const { Pool } = require("pg");

const pool = new Pool({
    user: configDevnet.components.storage.user,
    host: configDevnet.components.storage.host,
    database: configDevnet.components.storage.database,
    password: configDevnet.components.storage.password,
    port: configDevnet.components.storage.port
});

module.exports.findQuestion = async (params, offset) => {
    if (!params || (!params.id && !params.senderId && !params.answerId)) return {success: false}
    if (!offset) offset = 0;

    let client = undefined;
    try {
        client = await pool.connect();

        let where = "";
        let conditionValue = "";
        if (params.id) {
            where = `trs51."id" = $1`;
            conditionValue = params.id;
        } else if (params.senderId) {
            where = `trs51."senderId" = $1`;
            conditionValue = params.senderId;
        } else if (params.answerId) {
            console.log(params.answerId)
            where = `EXISTS (
                SELECT 1
                  FROM trs as trs52
                 WHERE trs52."type" = 52
                   AND trs52."asset" ->> 'data' = trs51."id"
                   AND trs52."senderId" = $1
                 LIMIT 1
            )`;
            conditionValue = params.answerId;
        }

        const query = `
            SELECT count(trs51."id") over() as max_count,
                   trs51."id",
                   trs51."senderId",
                   trs51."timestamp",
                   (trs51."asset" -> 'quiz' ->> 'question') as question,
                   (trs51."asset" -> 'quiz' ->> 'url') as url,
                   (trs51."asset" -> 'quiz' ->> 'answer') as answer,
                   (trs51."asset" -> 'quiz' ->> 'reward') as reward,
                   (trs51."asset" -> 'quiz' ->> 'num')::INT as num,
                   (SELECT count(*)
                      FROM trs as trs52
                     WHERE trs52."type" = 52
                       AND trs52."asset" ->> 'data' = trs51."id")::INT as answered
              FROM trs as trs51
             WHERE trs51."type" = 51
               AND ${where}
             ORDER BY timestamp DESC
             LIMIT 100 OFFSET ${offset*100}
        `;
        const result = await client.query(query, [conditionValue]);
        return {success: true, data: result.rows}

    } catch(err) {
        console.log(err)
        return {success: false}

    } finally {
        client.release();
    }
}

module.exports.findAnswer = async (params, offset) => {
    if (!params || (!params.id && !params.senderId && !params.questionId)) return {success: false}
    if (!offset) offset = 0;

    let client = undefined;
    try {
        client = await pool.connect();

        let where = "";
        let conditionValue = "";
        if (params.id) {
            where = `trs."id" = $1`;
            conditionValue = params.id;
        } else if (params.senderId) {
            where = `trs."senderId" = $1`;
            conditionValue = params.senderId;
        } else if (params.questionId) {
            where = `trs."asset" ->> 'data' = $1`;
            conditionValue = params.questionId;
        }

        const query = `
            SELECT count(trs."id") over() as max_count,
                   trs."id",
                   trs."senderId",
                   trs."timestamp",
                   trs."asset" ->> 'data' as questionId,
                   trs."asset" -> 'quiz' ->> 'reward' as reward
              FROM trs
             WHERE trs."type" = 52
               AND ${where}
             ORDER BY timestamp DESC
             LIMIT 100 OFFSET ${offset*100}
        `;
        const result = await client.query(query, [conditionValue]);
        return {success: true, data: result.rows}

    } catch(err) {
        console.log(err)
        return {success: false}

    } finally {
        client.release();
    }
}

module.exports.findOpenCloseQuestion = async (isOpen, params) => {
    let client = undefined;
    try {
        // set senderId (default 0L)
        const senderId = params.senderId? params.senderId: "0L";

        // set offset (default 0)
        const offset = params.offset? +params.offset: 0;

        // set sortType (0: DESC, 1: ASC)
        const sortType = params.sortType? "ASC": "DESC";

        // set sortKey (timestamp or num or reward. default timestamp)
        let sortKey = `timestamp ${sortType}`;
        if (params.sortKey.toUpperCase() == "NUM") {
            sortKey = `trs51."asset" -> 'quiz' ->> 'num' ${sortType}, timestamp DESC`;
        } else if (params.sortKey.toUpperCase() == "REWARD") {
            sortKey = `trs51."asset" -> 'quiz' ->> 'reward' ${sortType}, timestamp DESC`;
        }
        client = await pool.connect();
        const query = `
            SELECT count(trs51."id") over() as max_count,
                   trs51."id",
                   trs51."senderId",
                   trs51."timestamp",
                   (trs51."asset" -> 'quiz' ->> 'question') as question,
                   (trs51."asset" -> 'quiz' ->> 'url') as url,
                   (trs51."asset" -> 'quiz' ->> 'answer') as answer,
                   (trs51."asset" -> 'quiz' ->> 'reward') as reward,
                   (trs51."asset" -> 'quiz' ->> 'num')::INT as num,
                   (SELECT count(*)
                      FROM trs as trs52
                     WHERE trs52."type" = 52
                       AND trs52."asset" ->> 'data' = trs51."id")::INT as answered
              FROM trs as trs51
             WHERE trs51."type" = 51
               AND trs51."senderId" <> $1
               AND (
                       (trs51."asset" -> 'quiz' ->> 'num')::INT ${isOpen? ">": "<="} (
                           SELECT count(*)
                            FROM trs as trs52
                           WHERE trs52."type" = 52
                             AND trs52."asset" ->> 'data' = trs51."id"
                       )
                       ${isOpen? "AND NOT": "OR"} EXISTS (
                           SELECT 1
                             FROM trs as trs52
                            WHERE trs52."type" = 52
                              AND trs52."asset" ->> 'data' = trs51."id"
                              AND trs52."senderId" = $2
                            LIMIT 1
                       )
                   )
            ORDER BY ${sortKey}
            LIMIT 100 OFFSET ${offset*100}
        `;
        const result = await client.query(query, [senderId, senderId]);
        return {success: true, data: result.rows}

    } catch(err) {
        console.log(err)
        return {success: false}

    } finally {
        client.release();
    }
}
