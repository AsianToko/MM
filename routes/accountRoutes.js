const express = require("express");
const router = express.Router();

router.post("/save-movie", (req, res) => {
  const { movieId, movieTitle } = req.body;

  if (!req.session.savedMovies) {
    req.session.savedMovies = [];
  }

  if (!req.session.savedMovies.some((movie) => movie.id === movieId)) {
    req.session.savedMovies.push({ id: movieId, title: movieTitle });
  }

  res.redirect("/account");
});

router.get("/account", (req, res) => {
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

module.exports = router;
