const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "static")));

// Middleware om form-data te verwerken
app.use(express.urlencoded({ extended: true }));

// JSON-bestand met gebruikersgegevens
const users = require("./credentials.json");

// Route om het inlogformulier te tonen
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

// Route om de inloggegevens te verwerken
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Controleer of de gebruiker bestaat
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.send(`<h2>Welkom, ${username}!</h2>`);
  } else {
    res.send(
      `<h2>Ongeldige gebruikersnaam of wachtwoord</h2><a href="/">Opnieuw proberen</a>`
    );
  }
});

// Start de server
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
