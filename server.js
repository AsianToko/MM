/* eslint-disable no-undef */
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const bcrypt = require("bcrypt");
const xss = require("xss");
const { trending, nowplaying } = require("./api");
const saltRounds = 10;
const session = require("express-session"); // Importeer express-session

const multer = require("multer");
const fs = require("fs");

// Set up storage for profile pictures
const storage = multer.diskStorage({
  destination: "./static/uploads/",
  filename: (req, file, cb) => {
    cb(null, `${req.session.username}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const app = express();
const PORT = 4000;

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

app.use((req, res, next) => {
  res.locals.session = req.session; // Make session available in EJS views
  next();
});

//  Homepagina met films van TMDB
app.get("/", async (req, res) => {
  try {
    const trendingMovies = await trending();
    const nowPlayingMovies = await nowplaying();

    console.log("Trending movies:", trendingMovies.results.length);
    console.log("Now playing movies:", nowPlayingMovies.results.length);

    res.render("pages/home", {
      trendingMovies: trendingMovies.results,
      nowPlayingMovies: nowPlayingMovies.results,
    });
  } catch (error) {
    console.error("Fout bij het ophalen van films:", error);
    res
      .status(500)
      .send("Er is een fout opgetreden bij het laden van de films.");
  }
});

//  Registratiepagina weergeven
app.get("/register", (req, res) => {
  res.render("pages/register");
});
// Gebruiker registreren
app.post("/register", async (req, res) => {
  const username = xss(req.body.username);
  const password = xss(req.body.password);

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const database = client.db("login");
    const usersCollection = database.collection("login");

    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      res.send(
        `<h2>Gebruikersnaam is al in gebruik</h2><a href="/register">Opnieuw proberen</a>`
      );
    } else {
      await usersCollection.insertOne({
        username,
        password: hashedPassword,
        profilePicture: "/default-avatar.png", // Default profile picture
      });
      // Direct inloggen en doorgaan naar account
      req.session.username = username; // Store username in session
      res.redirect("/account"); // Redirect naar accountpagina
    }
  } catch (err) {
    console.error("Error bij registreren:", err);
    res.status(500).send("Interne serverfout.");
  }
});

// Update the /upload-profile-pic route
app.post("/upload-profile-pic", upload.single("profilePic"), async (req, res) => {
  console.log("Session username:", req.session.username); // Debug log

  if (!req.session.username) {
    return res.status(401).send("Je moet ingelogd zijn.");
  }

  try {
    const database = client.db("login");
    const usersCollection = database.collection("login");

    // Read the uploaded file and encode it as Base64
    const profilePicPath = req.file.path;
    const profilePicData = fs.readFileSync(profilePicPath, { encoding: "base64" });

    // Update the user's profile picture in the database
    await usersCollection.updateOne(
      { username: req.session.username },
      { $set: { profilePicture: profilePicData } }
    );

    // Delete the uploaded file from the local filesystem
    fs.unlinkSync(profilePicPath);

    res.redirect("/account");
  } catch (err) {
    console.error("Error updating profile picture:", err);
    res.status(500).send("Er is een fout opgetreden.");
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
      res
        .status(401)
        .send(
          `<h2>Ongeldige gebruikersnaam of wachtwoord</h2><a href="/login">Opnieuw proberen</a>`
        );
    }
  } catch (err) {
    console.error("Error bij inloggen:", err); // Log the error
    res.status(500).send("Interne serverfout.");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Fout bij uitloggen:", err);
      return res.status(500).send("Er is een fout opgetreden.");
    }
    res.redirect("/login"); // Stuur de gebruiker terug naar de loginpagina
  });
});

// Update the /save-movie route
app.post("/save-movie", async (req, res) => {
  const { movieId, movieTitle, posterPath } = req.body;

  if (!req.session.username) {
    return res.status(401).send("Je moet ingelogd zijn.");
  }

  try {
    const database = client.db("login");
    const usersCollection = database.collection("login");

    // Add the movie to the user's savedMovies array in the database
    await usersCollection.updateOne(
      { username: req.session.username },
      {
        $addToSet: {
          savedMovies: {
            id: movieId,
            title: movieTitle,
            poster_path: posterPath,
          },
        },
      }
    );

    res.redirect("/account");
  } catch (err) {
    console.error("Error saving movie:", err);
    res.status(500).send("Er is een fout opgetreden.");
  }
});

// Update the /account route to render the profile picture from the database
app.get("/account", async (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }

  try {
    const database = client.db("login");
    const usersCollection = database.collection("login");

    const user = await usersCollection.findOne({ username: req.session.username });

    res.render("pages/account", {
      username: req.session.username,
      profilePicture: user.profilePicture
        ? `data:image/png;base64,${user.profilePicture}` // Render Base64 image
        : "/default-avatar.png",
      savedMovies: user.savedMovies || [],
    });
  } catch (err) {
    console.error("Error rendering account page:", err);
    res.status(500).send("Interne serverfout.");
  }
});

// Detailpagina
app.get("/detail", async (req, res) => {
  const movieId = req.query.id;
  try {
    const movieResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
      options
    );
    if (!movieResponse.ok)
      throw new Error(`TMDB API error: ${movieResponse.statusText}`);
    const movie = await movieResponse.json();

    const creditsResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`,
      options
    );
    if (!creditsResponse.ok)
      throw new Error(`TMDB API error: ${creditsResponse.statusText}`);
    const credits = await creditsResponse.json();

    res.render("pages/detail", { movie, cast: credits.cast });
  } catch (error) {
    console.error("Error fetching movie details:", error);
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
