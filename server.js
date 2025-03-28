/* eslint-disable no-undef */
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const bcrypt = require("bcrypt");
const xss = require("xss");
const { trending, nowplaying } = require("./api");
const saltRounds = 10;
const session = require("express-session"); // Import express-session

const app = express();
const PORT = 3000;

// Instellen van de view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Statische bestanden (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "static")));

// Middleware om form-data te verwerken
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(
  session({
    secret: "your-secret-key", // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `secure: true` only if using HTTPS
  })
);

// MongoDB connectie-instellingen
const uri = "mongodb+srv://admin:admin@mmdb.barfq.mongodb.net/?retryWrites=true&w=majority&appName=MMdb";
const client = new MongoClient(uri);

// TMDB API instellingen
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
};

//  Homepagina met films van TMDB
app.get("/", async (req, res) => {
  try {
    const trendingMovies = await trending();
    const nowPlayingMovies = await nowplaying();

    console.log("Trending movies:", trendingMovies.results.length);
    console.log("Now playing movies:", nowPlayingMovies.results.length);

    res.render("pages/home", { trendingMovies: trendingMovies.results, nowPlayingMovies: nowPlayingMovies.results });
  } catch (error) {
    console.error("Fout bij het ophalen van films:", error);
    res.status(500).send("Er is een fout opgetreden bij het laden van de films.");
  }
});

//  Registratiepagina weergeven
app.get("/register", (req, res) => {
  res.render("pages/register");
});

//  Gebruiker registreren
app.post("/register", async (req, res) => {
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

//  Loginpagina weergeven
app.get("/login", (req, res) => {
  res.render("pages/login");
});

//  Inloggen
app.post("/login", async (req, res) => {
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

// Route to save a movie to the user's account
app.post("/save-movie", (req, res) => {
  const { movieId, movieTitle } = req.body;

  if (!req.session.savedMovies) {
    req.session.savedMovies = [];
  }

  // Avoid duplicates
  if (!req.session.savedMovies.some((movie) => movie.id === movieId)) {
    req.session.savedMovies.push({ id: movieId, title: movieTitle });
  }

  res.redirect("/account");
});

// Route to view saved movies
app.get("/account", (req, res) => {
  try {
    if (req.session && req.session.username) {
      const savedMovies = req.session.savedMovies || [];
      res.render("pages/account", { username: req.session.username, savedMovies });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error rendering account page:", err);
    res.status(500).send("Interne serverfout.");
  }
});

// Detailpagina
app.get("/detail", async (req, res) => {
  const movieId = req.query.id;
  try {
    const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options);
    if (!movieResponse.ok) throw new Error(`TMDB API error: ${movieResponse.statusText}`);
    const movie = await movieResponse.json();

    const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`, options);
    if (!creditsResponse.ok) throw new Error(`TMDB API error: ${creditsResponse.statusText}`);
    const credits = await creditsResponse.json();

    res.render("pages/detail", { movie, cast: credits.cast });
  } catch (error) {
    console.error("Error fetching movie details:", error); // Log the error
    res.status(500).send("Interne serverfout.");
  }
});

//  MongoDB connectie check
app.get("/check-mongodb-connection", (req, res) => {
  if (client.topology && client.topology.isConnected()) {
    res.send("MongoDB is verbonden");
  } else {
    res.send("MongoDB is niet verbonden");
  }
});

//  Server starten na MongoDB connectie
const startServer = async () => {
  try {
    await client.connect();
    console.log(" Verbonden met MongoDB!");

    app.listen(PORT, () => {
      console.log(` Server draait op http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" MongoDB verbinding mislukt:", err);
    process.exit(1);
  }
};

startServer();
