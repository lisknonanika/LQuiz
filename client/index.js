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
        let message = "";
        if (req.session.message) {
            message = req.session.message;
            req.session.message = null;
        }
        if (req.session.address) res.render("/top");
        else if (req.query.error) res.render("index", {msg: message, type: "error"});
        else if (req.query.timeout) res.render("index", {msg: "Session Timeout.", type: "error"});
        else res.render("index", {msg: "", type: "info"});
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
            res.redirect('/?timeout=true');
            return;
        }
        res.render("top");
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
            req.session.message = "Passphrase is required";
            res.redirect("/?error=true");
            return;
        }
        if (req.body.passphrase.split(" ").length != 12) {
            req.session.message = "Incorrect passphrase";
            res.redirect("/?error=true");
            return;
        }
        try {
            req.session.address = cryptography.getAddressFromPassphrase(req.body.passphrase);
            res.redirect("/");
        } catch (err) {
            req.session.message = "Incorrect passphrase";
            res.redirect("/?error=true");
            return;
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
 * POST: guest
 */
router.post("/guest", (req, res) => {
    (async () => {
        req.session.message = null;
        req.session.address = "0L";
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
 * GET: logout
 */
router.get("/logout", (req, res) => {
    (async () => {
        req.session.address = null;
        req.session.message = null;
        res.redirect("/");
    })().catch((err) => {
        // SYSTEM ERROR
        console.log(err);
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