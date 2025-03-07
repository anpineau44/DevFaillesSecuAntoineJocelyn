const express = require("express");
const sql = require("mssql");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");

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

function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
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

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send("Tous les champs sont obligatoires !");
    }

    if (!validatePassword(password)) {
        return res.send(`
            <h1>Mot de passe non sécurisé !</h1>
            <p>Le mot de passe doit contenir au moins :</p>
            <ul>
                <li>8 caractères</li>
                <li>1 lettre majuscule</li>
                <li>1 lettre minuscule</li>
                <li>1 chiffre</li>
                <li>1 caractère spécial (@$!%*?&)</li>
            </ul>
            <p><a href="/register">Réessayer</a></p>
        `);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const request = new sql.Request();
        request.input("username", sql.VarChar, username);
        request.input("password", sql.VarChar, hashedPassword);

        await request.query("INSERT INTO users (username, password) VALUES (@username, @password)");

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

        const result = await request.query("SELECT id, username FROM users WHERE id = @userId");

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
