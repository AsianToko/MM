const express = require("express");
const { trending, nowplaying } = require("../api");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const trendingMovies = await trending();
    const nowPlayingMovies = await nowplaying();

    res.render("pages/home", { trendingMovies: trendingMovies.results, nowPlayingMovies: nowPlayingMovies.results });
  } catch (error) {
    console.error("Fout bij het ophalen van films:", error);
    res.status(500).send("Er is een fout opgetreden bij het laden van de films.");
  }
});

module.exports = router;
