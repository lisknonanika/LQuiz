const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { api_config } = require('../config');
const { request, checkUtil } = require('../utility');

const db = require('./db')
const question = require('./transaction/question');
const answer = require('./transaction/answer');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(helmet());

const router = express.Router();
app.use('/api', router);

/**
 * Question Transaction
 */
router.post('/question', (req, res) => {
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
            method: 'POST',
            url: 'http://127.0.0.1:4000/api/transactions',
            headers: {'content-type': 'application/json'},
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
router.post('/answer', (req, res) => {
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
            method: 'POST',
            url: 'http://127.0.0.1:4000/api/transactions',
            headers: {'content-type': 'application/json'},
            body: tx,
            json: true
        });

        res.json({success: true, response: data});

    })().catch((err) => {
        res.json({success: false, err: err});
    });
});

/**
 * Get Answers
 * query: qid(required)
 */
router.get('/answers', (req, res) => {
    (async () => {
        // Validation
        if (!req.query.qid) {
            res.json({success: false, messages: 'Parameter "qid" is required.'});
            return;
        }

        // GET
        const answerTransactions = await db.findAnswerByQuestionId(req.query.qid)
        if (!answerTransactions.success) {
            res.json({success: false, messages: 'Failed to get answer data'});
            return;
        }

        res.json({success: true, response: answerTransactions.data});

    })().catch((err) => {
        res.json({success: false, err: err});
    });
});

/**
 * Get Questions
 * query: open, userId, offset, sortKey, sortType
 */
router.get('/questions', (req, res) => {
    (async () => {
        let isOpen = true;
        let params = {
            senderId: '0L',
            offset: 0,
            sortKey: 'timestamp',
            sortType: 0,
        }
        
        // Set Params
        if (req.query.open && req.query.open == "0") isOpen = false;
        if (req.query.userId) params.senderId = req.query.userId;
        if (req.query.offset && checkUtil.checkNumber(req.query.offset)) params.offset = +req.query.offset;
        if (req.query.sortKey) params.sortKey = req.query.sortKey;
        if (req.query.sortType && req.query.sortType != "0") params.sortType = 1;
        
        // GET
        const questionTransactions = await db.findQuestion(isOpen, params)
        if (!questionTransactions.success) {
            res.json({success: false, messages: 'Failed to get question data'});
            return;
        }

        res.json({success: true, response: questionTransactions.data});

    })().catch((err) => {
        res.json({success: false, err: err});
    });
});

app.listen(30001);
console.log('http_api start');
