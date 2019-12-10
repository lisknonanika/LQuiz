const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const { api_config } = require('../config');
const request = require('../request');

const question = require('./transaction/question');

const app = express();
app.set('secret', api_config.secret);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(helmet());

const router = express.Router();
app.use('/httpapi', router);

/**
 * Question Transaction
 */
router.post('/question', (req, res) => {
    (async () => {
        // Validation
        const errors = question.validator(req);
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

app.listen(40001);
console.log();