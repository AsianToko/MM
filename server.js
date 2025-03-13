/* eslint-disable no-undef */
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const bcrypt = require("bcrypt");
const xss = require("xss");
const session = require("express-session");
const fetch = require("node-fetch"); // Voeg deze regel toe om fetch te importeren
const saltRounds = 10;

const app = express();
const PORT = 3000;

// Instellen van de view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Statische bestanden (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "static")));

// Middleware om form-data te verwerken
app.use(express.urlencoded({ extended: true }));

// Sessies configureren
app.use(session({
  secret: process.env.JWT_SECRET, // Gebruik de waarde van JWT_SECRET als de secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// MongoDB connectie-instellingen
const uri =
  "mongodb+srv://admin:admin@mmdb.barfq.mongodb.net/?retryWrites=true&w=majority&appName=MMdb";
const client = new MongoClient(uri);

// TMDB API instellingen
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
};

// ✅ Sessiegegevens controleren
app.get("/session", (req, res) => {
  res.send(req.session);
});

// ✅ Gastensessie maken
app.get("/create-guest-session", async (req, res) => {
  try {
    const response = await fetch("https://api.themoviedb.org/3/authentication/guest_session/new", {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
      },
    });
    const data = await response.json();
    req.session.guestSessionId = data.guest_session_id;
    res.send(`Gastensessie aangemaakt: ${data.guest_session_id}`);
  } catch (error) {
    console.error("Fout bij het maken van een gastensessie:", error);
    res.status(500).send("Er is een fout opgetreden bij het maken van een gastensessie.");
  }
});

// ✅ Homepagina met films van TMDB
app.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/trending/movie/day?language=en-US",
      options
    );
    const data = await response.json();

    console.log("Movies opgehaald:", data.results.length);
    res.render("pages/home", { movies: data.results });
  } catch (error) {
    console.error("Fout bij het ophalen van films:", error);
    res.status(500).send("Er is een fout opgetreden bij het laden van de films.");
  }
});

// ✅ Registratiepagina weergeven
app.get("/register", (req, res) => {
  res.render("pages/register");
});

// ✅ Gebruiker registreren
app.post("/register", async (req, res) => {
  const username = xss(req.body.username);
  const password = xss(req.body.password);

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const database = client.db("login");
    const usersCollection = database.collection("login");

    // Controleer of de gebruiker al bestaat
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

// ✅ Loginpagina weergeven
app.get("/login", (req, res) => {
  res.render("pages/login");
});

// ✅ Inloggen
app.post("/login", async (req, res) => {
  const username = xss(req.body.username);
  const password = xss(req.body.password);

  try {
    const database = client.db("login");
    const usersCollection = database.collection("login");

    const user = await usersCollection.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = { username }; // Sla de gebruiker op in de sessie
      res.send(`<h2>Welkom, ${username}!</h2>`);
    } else {
      res.send(`<h2>Ongeldige gebruikersnaam of wachtwoord</h2><a href="/">Opnieuw proberen</a>`);
    }
  } catch (err) {
    console.error("Error bij inloggen:", err);
    res.status(500).send("Interne serverfout.");
  }
});

// ✅ Detailpagina
app.get("/detail", (req, res) => {
  res.render("pages/detail");
});

// ✅ MongoDB connectie check
app.get("/check-mongodb-connection", (req, res) => {
  if (client.topology && client.topology.isConnected()) {
    res.send("MongoDB is verbonden");
  } else {
    res.send("MongoDB is niet verbonden");
  }
});

// ✅ Server starten na MongoDB connectie
const startServer = async () => {
  try {
    await client.connect();
    console.log("✅ Verbonden met MongoDB!");

    app.listen(PORT, () => {
      console.log(`🚀 Server draait op http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB verbinding mislukt:", err);
    process.exit(1);
  }
};

startServer();
