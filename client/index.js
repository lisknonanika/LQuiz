const cryptography = require("@liskhq/lisk-cryptography");
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
        if (req.session.address) res.redirect("/top");
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
 * GET: top
 */
router.get("/top", (req, res) => {
    (async () => {
        req.session.message = null;
        if (!req.session.address) {
            req.session.message = {type: "warning", msg: "Please Re-Login"};
            res.redirect('/');
            return;
        }
        res.render("top", {address: req.session.address});
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
            req.session.message = {type: "danger", msg: "Passphrase is required"};

        } else if (req.body.passphrase.split(" ").length != 12) {
            req.session.message = {type: "danger", msg: "Incorrect passphrase"};
        } else {
            try {
                req.session.address = cryptography.getAddressFromPassphrase(req.body.passphrase);
            } catch (err) {
                req.session.message = {type: "danger", msg: "Incorrect passphrase"};
            }
        }
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