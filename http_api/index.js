const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const config = require("../config");
const { request, checkUtil } = require("../utility");

const db = require("./db")
const question = require("./transaction/question");
const answer = require("./transaction/answer");
const faucet = require("./transaction/faucet");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(helmet());

const router = express.Router();

const getErrorMessage = (err) => {
    let errs = [];
    if (err.errors && Array.isArray(err.errors)) {
        for (msg of err.errors) if (msg.message) errs.push(msg.message);
    } else if (err.message) errs.push(err.message);
    return errs;
}

app.use(
    "/api",
    (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Methods', 'GET,POST,HEAD,OPTIONS');
        next();
    },
    router
);

/**
 * Question Transaction
 */
router.post("/question", (req, res) => {
    (async () => {
        // Validation
        const errors = await question.validator(req);
        if (errors.length > 0) {
            res.json({success: false, messages: errors});
            return;
        }

        // Create Transactino
        const tx = question.createTransaction(req);

        // POST
        const data = await request({
            method: "POST",
            url: `${config.liskapiurl}/api/transactions`,
            headers: {"content-type": "application/json"},
            body: tx,
            json: true
        });

        res.json({success: true, response: {id:tx.id, ...data}});

    })().catch((err) => {
        console.log(err.errors);
        res.json({success: false, messages: getErrorMessage(err)});
    });
});

/**
 * Answer Transaction
 */
router.post("/answer", (req, res) => {
    (async () => {
        // Validation
        const errors = await answer.validator(req);
        if (errors.length > 0) {
            res.json({success: false, messages: errors});
            return;
        }

        // Create Transactino
        const tx = answer.createTransaction(req);

        // POST
        const data = await request({
            method: "POST",
            url: `${config.liskapiurl}/api/transactions`,
            headers: {"content-type": "application/json"},
            body: tx,
            json: true
        });

        res.json({success: true, response: {id:tx.id, ...data}});

    })().catch((err) => {
        console.log(err);
        res.json({success: false, messages: getErrorMessage(err)});
    });
});

/**
 * Faucet Transaction
 */
router.post("/faucet", (req, res) => {
    (async () => {
        // Validation
        const errors = await faucet.validator(req);
        if (errors.length > 0) {
            res.json({success: false, messages: errors});
            return;
        }

        // Create Transactino
        const tx = faucet.createTransaction(req);

        // POST
        const data = await request({
            method: "POST",
            url: `${config.liskapiurl}/api/transactions`,
            headers: {"content-type": "application/json"},
            body: tx,
            json: true
        });

        res.json({success: true, response: data});

    })().catch((err) => {
        console.log(err);
        res.json({success: false, messages: getErrorMessage(err)});
    });
});

/**
 * Get Question
 * query: offset, id or senderId
 */
router.get("/question", (req, res) => {
    (async () => {
        let offset = 0;
        let params = {
            id: "",
            senderId: "",
            answerId: ""
        }

        // Check Params
        if (!req.query.id && !req.query.senderId && !req.query.answerId) {
            res.json({success: false, messages: "Parameter 'id' or 'senderId' or 'answerId' is required"});
            return;
        }
        
        // Set Params
        if (req.query.id) params.id = req.query.id.trim();
        if (req.query.senderId) params.senderId = req.query.senderId.trim().toUpperCase();
        if (req.query.answerId) params.answerId = req.query.answerId.trim().toUpperCase();
        if (req.query.offset && checkUtil.checkNumber(req.query.offset)) offset = +req.query.offset;
        
        // GET
        const trx = await db.findQuestion(params, offset)
        if (!trx.success) {
            res.json({success: false, messages: "Failed to get question data"});
            return;
        }

        res.json({success: true, response: trx.data});

    })().catch((err) => {
        console.log(err);
        res.json({success: false, messages: getErrorMessage(err)});
    });
});

/**
 * Get Answer
 * query: offset, id or senderId or qid
 */
router.get("/answer", (req, res) => {
    (async () => {
        let offset = 0;
        let params = {
            id: "",
            senderId: "",
            questionId: ""
        }

        // Check Params
        if (!req.query.id && !req.query.senderId && !req.query.qid) {
            res.json({success: false, messages: "Parameter 'id' or 'senderId' or 'qid' is required"});
            return;
        }
        
        // Set Params
        if (req.query.id) params.id = req.query.id.trim();
        if (req.query.senderId) params.senderId = req.query.senderId.trim().toUpperCase();
        if (req.query.qid) params.questionId = req.query.qid.trim();
        if (req.query.offset && checkUtil.checkNumber(req.query.offset)) offset = +req.query.offset;

        // GET
        const trx = await db.findAnswer(params, offset)
        if (!trx.success) {
            res.json({success: false, messages: "Failed to get answer data"});
            return;
        }

        res.json({success: true, response: trx.data});

    })().catch((err) => {
        console.log(err);
        res.json({success: false, messages: getErrorMessage(err)});
    });
});

/**
 * Get Open Question
 * query: userId, offset, sortKey, sortType
 */
router.get("/open-question", (req, res) => {
    (async () => {
        let params = {
            senderId: "0L",
            filter: "",
            offset: 0,
            sortKey: "timestamp",
            sortType: 0,
        }
        
        // Set Params
        if (req.query.userId) params.senderId = req.query.userId.trim().toUpperCase();
        if (req.query.filter) params.filter = req.query.filter.trim().toUpperCase();
        if (req.query.offset && checkUtil.checkNumber(req.query.offset)) params.offset = +req.query.offset;
        if (req.query.sortKey) params.sortKey = req.query.sortKey.trim().toUpperCase();
        if (req.query.sortType && req.query.sortType != "0") params.sortType = 1;
        
        // GET
        const trx = await db.findOpenCloseQuestion(true, params);
        if (!trx.success) {
            res.json({success: false, messages: "Failed to get question data"});
            return;
        }

        res.json({success: true, response: trx.data});

    })().catch((err) => {
        console.log(err);
        res.json({success: false, messages: getErrorMessage(err)});
    });
});

/**
 * Get Close Question
 * query: userId, offset, sortKey, sortType
 */
router.get("/close-question", (req, res) => {
    (async () => {
        let params = {
            senderId: "0L",
            filter: "",
            offset: 0,
            sortKey: "timestamp",
            sortType: 0,
        }
        
        // Set Params
        if (req.query.userId) params.senderId = req.query.userId.trim().toUpperCase();
        if (req.query.filter) params.filter = req.query.filter.trim().toUpperCase();
        if (req.query.offset && checkUtil.checkNumber(req.query.offset)) params.offset = +req.query.offset;
        if (req.query.sortKey) params.sortKey = req.query.sortKey.trim().toUpperCase();
        if (req.query.sortType && req.query.sortType != "0") params.sortType = 1;
        
        // GET
        const trx = await db.findOpenCloseQuestion(false, params);
        if (!trx.success) {
            res.json({success: false, messages: "Failed to get question data"});
            return;
        }

        res.json({success: true, response: trx.data});

    })().catch((err) => {
        console.log(err);
        res.json({success: false, messages: getErrorMessage(err)});
    });
});

app.listen(config.api.port);
console.log("http_api start");
