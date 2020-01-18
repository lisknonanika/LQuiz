const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const { api_config } = require('../config');
const { request, verify } = require('../utility');

const question = require('./transaction/question');
const answer = require('./transaction/answer');

const app = express();
app.set('secret', api_config.secret);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(helmet());

const router = express.Router();
app.use('/api', router);

/**
 * auth
 */
router.post('/auth', (req, res) => {
    (async () => {
        if (!req.body.address) {
            res.json({success: false, messages: ["Address is required"]});
            return;
        }
        const token = jwt.sign({address: req.body.address}, app.get('secret'));
        res.json({result: true, token: token});

    })().catch((err) => {
        res.json({success: false, err: err});
    });
});

/**
 * Question Transaction
 */
router.post('/question', verify, (req, res) => {
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
router.post('/answer', verify, (req, res) => {
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

app.listen(40001);
console.log('http_api start');