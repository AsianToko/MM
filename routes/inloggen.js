const express = require("express");
const bcrypt = require("bcrypt");
const xss = require("xss");
const { MongoClient } = require("mongodb");

const router = express.Router();

// MongoDB connectie-instellingen
const uri = "mongodb+srv://admin:admin@mmdb.barfq.mongodb.net/?retryWrites=true&w=majority&appName=MMdb";
const client = new MongoClient(uri);

// Loginpagina weergeven
router.get("/login", (req, res) => {
  res.render("pages/login");
});

// Inloggen
router.post("/login", async (req, res) => {
  const username = xss(req.body.username);
  const password = xss(req.body.password);

  try {
    const database = client.db("login");
    const usersCollection = database.collection("login");

    const user = await usersCollection.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.username = username; // Store username in session
      console.log("User logged in:", username); // Debug log
      res.redirect("/account"); // Redirect to account page
    } else {
      console.log("Invalid login attempt"); // Debug log
      res.status(401).send(`<h2>Ongeldige gebruikersnaam of wachtwoord</h2><a href="/login">Opnieuw proberen</a>`);
    }
  } catch (err) {
    console.error("Error bij inloggen:", err); // Log the error
    res.status(500).send("Interne serverfout.");
  }
});

module.exports = router;
