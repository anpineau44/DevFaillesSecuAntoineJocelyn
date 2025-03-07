const express = require("express");
const sql = require("mssql");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const csrf = require("csurf"); 

const app = express();
const port = 3000;

// Connexion SQL Server
const dbConfig = {
    user: "resto",
    password: "resto",
    server: "localhost",
    database: "SECU",
    options: { encrypt: false }
};

sql.connect(dbConfig).catch(err => console.error("Erreur connexion BDD", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: "vulnerableSecret", resave: false, saveUninitialized: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/", (req, res) => {
    res.render("login", { csrfToken: req.csrfToken() });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const request = new sql.Request();
        request.input("username", sql.VarChar, username);

        const result = await request.query("SELECT id, username, password FROM users WHERE username = @username");

        if (result.recordset.length > 0) {
            const user = result.recordset[0];

            const match = await bcrypt.compare(password, user.password);

            if (match) {
                req.session.user = { id: user.id, username: user.username };
                res.redirect(`/profile?id=${user.id}`);
            } else {
                res.send("Identifiants incorrects");
            }
        } else {
            res.send("Identifiants incorrects");
        }
    } catch (err) {
        console.error("Erreur lors de la connexion", err);
        res.send("Erreur serveur");
    }
});

app.get("/register", (req, res) => {
    res.render("register", { csrfToken: req.csrfToken() });
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send("Tous les champs sont obligatoires !");
    }

    if (!validatePassword(password)) {
        return res.send("Mot de passe trop faible !");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const request = new sql.Request();
        request.input("username", sql.VarChar, username);
        request.input("password", sql.VarChar, hashedPassword);

        await request.query("INSERT INTO users (username, password) VALUES (@username, @password)");

        res.send("Utilisateur créé avec succès !");
    } catch (err) {
        console.error("Erreur lors de la création de l'utilisateur", err);
        res.send("Erreur serveur");
    }
});

app.listen(port, () => console.log(`Serveur en ligne sur http://localhost:${port}`));
