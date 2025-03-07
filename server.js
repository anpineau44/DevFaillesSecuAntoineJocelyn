const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { randomUUID } = require("crypto");

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

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const request = new sql.Request();
        request.input("username", sql.VarChar, username);
        request.input("password", sql.VarChar, password); // Mot de passe en clair (comme demandé)
        
        const result = await request.query("SELECT id, username FROM users WHERE username = @username AND password = @password");

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            req.session.user = { id: user.id, username: user.username };
            res.redirect(`/profile?id=${user.id}`);
        } else {
            res.send("Identifiants incorrects");
        }
    } catch (err) {
        console.error("Erreur lors de la connexion", err);
        res.send("Erreur serveur");
    }
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send("Tous les champs sont obligatoires !");
    }

    try {
        const request = new sql.Request();
        request.input("id", sql.Char(36), randomUUID());
        request.input("username", sql.VarChar, username);
        request.input("password", sql.VarChar, password); 

        await request.query("INSERT INTO users (username, password) VALUES (@id, @username, @password)");

        res.send(`
            <h1>Utilisateur créé avec succès !</h1>
            <p><a href="/admin">Retour à l'administration</a></p>
        `);
    } catch (err) {
        console.error("Erreur lors de la création de l'utilisateur", err);
        res.send("Erreur serveur");
    }
});

app.get("/profile", async (req, res) => {
    const userId = req.query.id;

    if (!userId) {
        return res.send("ID utilisateur manquant !");
    }

    try {
        const request = new sql.Request();
        request.input("userId", sql.Int, userId);

        const result = await request.query("SELECT * FROM users WHERE id = @userId");

        if (result.recordset.length > 0) {
            const user = result.recordset[0];

            res.send(`
                <h1>Bienvenue ${user.username}</h1>
                <p>Votre ID est ${user.id}</p>
                <p>Ajoutez un message :</p>
            `);
        } else {
            res.send("Utilisateur non trouvé.");
        }
    } catch (err) {
        console.error("Erreur lors de la récupération des informations de l'utilisateur", err);
        res.send("Erreur serveur");
    }
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/register.html");
});

app.get("/admin", (req, res) => {
    res.send(`
            <h1>Bienvenue dans l'admin !</h1>
            <p><a href="/register"><button>Créer un nouvel utilisateur</button></a></p>
        `);
});

app.listen(port, () => console.log(`Serveur en ligne sur http://localhost:${port}`));
