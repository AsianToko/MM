const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "static")));

// Middleware om form-data te verwerken
app.use(express.urlencoded({ extended: true }));

const uri =
  "mongodb+srv://admin:admin@mmdb.barfq.mongodb.net/?retryWrites=true&w=majority&appName=MMdb";
const client = new MongoClient(uri);

client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");

    // Route om het registratieformulier te tonen
    app.get("/register", (req, res) => {
      res.sendFile(path.join(__dirname, "register.html"));
    });

    // Route om de registratiegegevens te verwerken
    app.post("/register", async (req, res) => {
      const { username, password } = req.body;

      try {
        const database = client.db("login");
        const usersCollection = database.collection("login");

        // Controleer of de gebruiker al bestaat
        const existingUser = await usersCollection.findOne({ username });

        if (existingUser) {
          res.send(
            `<h2>Gebruikersnaam is al in gebruik</h2><a href="/register">Opnieuw proberen</a>`
          );
        } else {
          // Voeg de nieuwe gebruiker toe
          await usersCollection.insertOne({ username, password });
          res.send(
            `<h2>Account succesvol aangemaakt</h2><a href="/">Inloggen</a>`
          );
        }
      } catch (err) {
        console.error("Error creating user", err);
        res.status(500).send("Internal Server Error");
      }
    });

    // Route om de inloggegevens te verwerken
    app.post("/login", async (req, res) => {
      const { username, password } = req.body;

      try {
        const database = client.db("login");
        const usersCollection = database.collection("login");

        // Controleer of de gebruiker bestaat
        const user = await usersCollection.findOne({ username, password });

        if (user) {
          res.send(`<h2>Welkom, ${username}!</h2>`);
        } else {
          res.send(
            `<h2>Ongeldige gebruikersnaam of wachtwoord</h2><a href="/">Opnieuw proberen</a>`
          );
        }
      } catch (err) {
        console.error("Error fetching user data", err);
        res.status(500).send("Internal Server Error");
      }
    });

    // Route to check MongoDB connection status
    app.get("/check-mongodb-connection", (req, res) => {
      if (client.topology && client.topology.isConnected()) {
        res.send("MongoDB is connected");
      } else {
        res.send("MongoDB is not connected");
      }
    });

    // Start de server
    app.listen(PORT, () => {
      console.log(`Server draait op http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// Route om het inlogformulier te tonen
app.get("/home", function (req, res) => {
  res,render("pages/home");
});


