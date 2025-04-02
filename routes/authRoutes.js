const express = require("express");
const bcrypt = require("bcrypt");
const xss = require("xss");
const { MongoClient } = require("mongodb");
const router = express.Router();
const saltRounds = 10;

const uri = "mongodb+srv://admin:admin@mmdb.barfq.mongodb.net/?retryWrites=true&w=majority&appName=MMdb";
const client = new MongoClient(uri);

router.get("/register", (req, res) => {
  res.render("pages/register");
});

router.post("/register", async (req, res) => {
  const username = xss(req.body.username);
  const password = xss(req.body.password);

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const database = client.db("login");
    const usersCollection = database.collection("login");

    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      res.send(`<h2>Gebruikersnaam is al in gebruik</h2><a href="/register">Opnieuw proberen</a>`);
    } else {
      await usersCollection.insertOne({ username, password: hashedPassword });
      res.send(`<h2>Account succesvol aangemaakt</h2><a href="/">Inloggen</a>`);
    }
  } catch (err) {
    console.error("Error bij registreren:", err);
    res.status(500).send("Interne serverfout.");
  }
});

router.get("/login", (req, res) => {
  res.render("pages/login");
});

router.post("/login", async (req, res) => {
  const username = xss(req.body.username);
  const password = xss(req.body.password);

  try {
    const database = client.db("login");
    const usersCollection = database.collection("login");

    const user = await usersCollection.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.username = username;
      res.redirect("/account");
    } else {
      res.status(401).send(`<h2>Ongeldige gebruikersnaam of wachtwoord</h2><a href="/login">Opnieuw proberen</a>`);
    }
  } catch (err) {
    console.error("Error bij inloggen:", err);
    res.status(500).send("Interne serverfout.");
  }
});

module.exports = router;
