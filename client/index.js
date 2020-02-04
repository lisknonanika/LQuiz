const cryptography = require("@liskhq/lisk-cryptography");
const passphrase = require("@liskhq/lisk-passphrase");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const helmet = require("helmet");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(helmet());
app.use(session({
    name: "lquiz-session",
    secret: "cookie-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        domain: '127.0.0.1'
    }
}));

const router = express.Router();
app.use("/", router);

/**
 * GET: login
 */
router.get("/", (req, res) => {
    (async () => {
        let messageType = "";
        let message = "";
        if (req.session.message) {
            messageType = req.session.message.type;
            message = req.session.message.msg;
            req.session.message = null;
        }
        if (req.session.address) res.redirect("/open-question");
        else res.render("index", {msg: message, type: messageType});
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
        req.session.address = null;
        req.session.message = null;
        res.status(500);
        res.render("500");
    });
});

/**
 * GET: open-question
 */
router.get("/open-question", (req, res) => {
    (async () => {
        req.session.message = null;
        if (!req.session.address) {
            req.session.message = {type: "warning", msg: "Please Re-Login"};
            res.redirect('/');
            return;
        }
        res.render("open-question", {address: req.session.address});
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
        req.session.address = null;
        req.session.message = null;
        res.status(500);
        res.render("500");
    });
});

/**
 * GET: close-question
 */
router.get("/close-question", (req, res) => {
    (async () => {
        req.session.message = null;
        if (!req.session.address) {
            req.session.message = {type: "warning", msg: "Please Re-Login"};
            res.redirect('/');
            return;
        }
        res.render("close-question", {address: req.session.address});
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
        req.session.address = null;
        req.session.message = null;
        res.status(500);
        res.render("500");
    });
});

/**
 * GET: create-question
 */
router.get("/create-question", (req, res) => {
    (async () => {
        req.session.message = null;
        if (!req.session.address) {
            req.session.message = {type: "warning", msg: "Please Re-Login"};
            res.redirect('/');
            return;
        }
        res.render("create-question", {address: req.session.address});
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
        req.session.address = null;
        req.session.message = null;
        res.status(500);
        res.render("500");
    });
});

/**
 * GET: my-question
 */
router.get("/my-question", (req, res) => {
    (async () => {
        req.session.message = null;
        if (!req.session.address) {
            req.session.message = {type: "warning", msg: "Please Re-Login"};
            res.redirect('/');
            return;
        }
        res.render("my-question", {address: req.session.address});
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
        req.session.address = null;
        req.session.message = null;
        res.status(500);
        res.render("500");
    });
});

/**
 * GET: my-answer
 */
router.get("/my-answer", (req, res) => {
    (async () => {
        req.session.message = null;
        if (!req.session.address) {
            req.session.message = {type: "warning", msg: "Please Re-Login"};
            res.redirect('/');
            return;
        }
        res.render("my-answer", {address: req.session.address});
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
        req.session.address = null;
        req.session.message = null;
        res.status(500);
        res.render("500");
    });
});

/**
 * POST: login
 */
router.post("/login", (req, res) => {
    (async () => {
        req.session.message = null;
        if (!req.body.passphrase) {
            res.json({success: false, err: "Passphrase is required"});

        } else if (!passphrase.Mnemonic.validateMnemonic(req.body.passphrase)) {
            res.json({success: false, err: "Incorrect passphrase"});
            
        } else {
            try {
                req.session.address = cryptography.getAddressFromPassphrase(req.body.passphrase);
                res.json({success: true});
            } catch (err) {
                res.json({success: false, err: "Incorrect passphrase"});
            }
        }
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
        req.session.address = null;
        req.session.message = null;
        res.json({success: false, err: "Login Failed"});
    });
});

/**
 * POST: logout
 */
router.post("/logout", (req, res) => {
    (async () => {
        req.session.address = null;
        req.session.message = {type: "success", msg: "Logout Success"};
        res.redirect("/");
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
        res.status(500);
        res.render("500");
    });
});

/**
 * POST: guest
 */
router.post("/guest", (req, res) => {
    (async () => {
        req.session.message = null;
        req.session.address = "Guest";
        res.redirect("/");
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
        req.session.address = null;
        req.session.message = null;
        res.status(500);
        res.render("500");
    });
});

app.use((req, res, next) => {
    res.status(404);
    res.render("404");
});

app.listen(30002);
console.log(`Client Start`);