const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const helmet = require("helmet");
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
        console.log(req.body)
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
            url: "http://127.0.0.1:4000/api/transactions",
            headers: {"content-type": "application/json"},
            body: tx,
            json: true
        });

        res.json({success: true, response: data});

    })().catch((err) => {
        res.json({success: false, err: err});
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
            url: "http://127.0.0.1:4000/api/transactions",
            headers: {"content-type": "application/json"},
            body: tx,
            json: true
        });

        res.json({success: true, response: data});

    })().catch((err) => {
        res.json({success: false, err: err});
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
            url: "http://127.0.0.1:4000/api/transactions",
            headers: {"content-type": "application/json"},
            body: tx,
            json: true
        });

        res.json({success: true, response: data});

    })().catch((err) => {
        res.json({success: false, err: err});
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
            senderId: ""
        }

        // Check Params
        if (!req.query.id && !req.query.senderId) {
            res.json({success: false, messages: "Parameter 'id' or 'senderId' is required"});
            return;
        }
        
        // Set Params
        if (req.query.id) params.id = req.query.id;
        if (req.query.senderId) params.senderId = req.query.senderId;
        if (req.query.offset && checkUtil.checkNumber(req.query.offset)) offset = +req.query.offset;
        
        // GET
        const trx = await db.findQuestion(params, offset)
        if (!trx.success) {
            res.json({success: false, messages: "Failed to get question data"});
            return;
        }

        res.json({success: true, response: trx.data});

    })().catch((err) => {
        res.json({success: false, err: err});
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
        if (req.query.id) params.id = req.query.id;
        if (req.query.senderId) params.senderId = req.query.senderId;
        if (req.query.qid) params.questionId = req.query.qid;
        if (req.query.offset && checkUtil.checkNumber(req.query.offset)) offset = +req.query.offset;

        // GET
        const trx = await db.findAnswer(params, offset)
        if (!trx.success) {
            res.json({success: false, messages: "Failed to get answer data"});
            return;
        }

        res.json({success: true, response: trx.data});

    })().catch((err) => {
        res.json({success: false, err: err});
    });
});

/**
 * Get Open Question
 * query: userId, offset, sortKey, sortType
 */
router.get("/oepn-question", (req, res) => {
    (async () => {
        let params = {
            senderId: "0L",
            offset: 0,
            sortKey: "timestamp",
            sortType: 0,
        }
        
        // Set Params
        if (req.query.userId) params.senderId = req.query.userId;
        if (req.query.offset && checkUtil.checkNumber(req.query.offset)) params.offset = +req.query.offset;
        if (req.query.sortKey) params.sortKey = req.query.sortKey;
        if (req.query.sortType && req.query.sortType != "0") params.sortType = 1;
        
        // GET
        const trx = await db.findOpenCloseQuestion(true, params)
        if (!trx.success) {
            res.json({success: false, messages: "Failed to get question data"});
            return;
        }

        res.json({success: true, response: trx.data});

    })().catch((err) => {
        res.json({success: false, err: err});
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
            offset: 0,
            sortKey: "timestamp",
            sortType: 0,
        }
        
        // Set Params
        if (req.query.userId) params.senderId = req.query.userId;
        if (req.query.offset && checkUtil.checkNumber(req.query.offset)) params.offset = +req.query.offset;
        if (req.query.sortKey) params.sortKey = req.query.sortKey;
        if (req.query.sortType && req.query.sortType != "0") params.sortType = 1;
        
        // GET
        const trx = await db.findOpenCloseQuestion(false, params)
        if (!trx.success) {
            res.json({success: false, messages: "Failed to get question data"});
            return;
        }

        res.json({success: true, response: trx.data});

    })().catch((err) => {
        res.json({success: false, err: err});
    });
});

app.listen(30001);
console.log("http_api start");
