/* eslint-disable no-undef */
const express = require("express");
const path = require("path");
require("dotenv").config();
const session = require("express-session");
const { client } = require("./js-modules/connect");

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

// Routes
const homeRoute = require("./routes/homeRoute");
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const detailRoute = require("./routes/detailRoute");

app.use(homeRoute);
app.use(authRoutes);
app.use(accountRoutes);
app.use(detailRoute);

// MongoDB connectie check
app.get("/check-mongodb-connection", (req, res) => {
  if (client.topology && client.topology.isConnected()) {
    res.send("MongoDB is verbonden");
  } else {
    res.send("MongoDB is niet verbonden");
  }
});

// Server starten na MongoDB connectie
client.connect().then(() => {
  console.log("Verbonden met MongoDB!");
  app.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("MongoDB verbinding mislukt:", err);
  process.exit(1);
});
