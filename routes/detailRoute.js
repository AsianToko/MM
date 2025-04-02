const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  },
};

router.get("/detail", async (req, res) => {
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
    console.error("Error fetching movie details:", error);
    res.status(500).send("Interne serverfout.");
  }
});

module.exports = router;
