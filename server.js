const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const bcrypt = require("bcrypt");
const xss = require("xss");
const { trending, nowplaying } = require("./api");
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

// MongoDB connectie-instellingen
const uri =
  "mongodb+srv://admin:admin@mmdb.barfq.mongodb.net/?retryWrites=true&w=majority&appName=MMdb";
const client = new MongoClient(uri);

// TMDB API instellingen
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NTIyMDU2NmFkZjhkZTE3MzkzYmRjZmIyYTEzZjExNSIsIm5iZiI6MTc0MDY4NDY3Mi4wNjYsInN1YiI6IjY3YzBiZDgwYmM2OTM1YTAwMWEyNWU3NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hv_If1vHVfOooP9pySjD1zYPAe2MTK6I23DrlfFKuV4",
  },
};

// ✅ Homepagina met films van TMDB
app.get("/", async (req, res) => {
  try {
    const trendingMovies = await trending();
    const nowPlayingMovies = await nowplaying();

    console.log("Movies opgehaald:", trendingMovies.results.length);
    res.render("pages/home", { trendingMovies: trendingMovies.results, nowPlayingMovies: nowPlayingMovies.results });
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
  const { username, password } = req.body;

  try {
    const database = client.db("login");
    const usersCollection = database.collection("login");

    // Controleer of de gebruiker al bestaat
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      res.send(`<h2>Gebruikersnaam is al in gebruik</h2><a href="/register">Opnieuw proberen</a>`);
    } else {
      await usersCollection.insertOne({ username, password });
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
  const { username, password } = req.body;

  try {
    const database = client.db("login");
    const usersCollection = database.collection("login");

    const user = await usersCollection.findOne({ username, password });

    if (user) {
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
