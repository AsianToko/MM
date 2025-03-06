const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
require('dotenv').config();
const xss = require("xss");
const validator = require("validator");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "static")));
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
};

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

app.get("/register", (req, res) => {
  res.render("pages/register");
});

app.post("/register", async (req, res) => {
  const username = xss(req.body.username);
  const password = xss(req.body.password);

  if (!validator.isAlphanumeric(username) || !validator.isLength(password, { min: 6 })) {
    return res.send(`<h2>Ongeldige gebruikersnaam of wachtwoord</h2><a href="/register">Opnieuw proberen</a>`);
  }

  try {
    const database = client.db("login");
    const usersCollection = database.collection("users");

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

app.get("/login", (req, res) => {
  res.render("pages/login");
});

app.post("/login", async (req, res) => {
  const username = xss(req.body.username);
  const password = xss(req.body.password);

  if (!validator.isAlphanumeric(username) || !validator.isLength(password, { min: 6 })) {
    return res.send(`<h2>Ongeldige gebruikersnaam of wachtwoord</h2><a href="/login">Opnieuw proberen</a>`);
  }

  try {
    const database = client.db("login");
    const usersCollection = database.collection("users");

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

app.get("/detail", (req, res) => {
  res.render("pages/detail");
});

app.get("/check-mongodb-connection", (req, res) => {
  if (client.topology && client.topology.isConnected()) {
    res.send("MongoDB is verbonden");
  } else {
    res.send("MongoDB is niet verbonden");
  }
});

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
