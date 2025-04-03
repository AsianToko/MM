document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const searchResults = document.getElementById("search-results");
  const searchModal = document.getElementById("search-modal");

  // Functie voor het uitvoeren van de zoekactie
  const searchMovies = async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    // Zoek films van TMDB
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          query
        )}&language=en-US&api_key=95220566adf8de17393bdcfb2a13f115`
      );
      if (!response.ok)
        throw new Error(`TMDB API error: ${response.statusText}`);
      const data = await response.json();

      // Vorige resultaten wissen
      searchResults.innerHTML = "";

      // Zoekresultaten weergeven
      data.results.forEach((movie) => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie-item");
        movieElement.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
          <p>${movie.title}</p>
        `;
        movieElement.addEventListener("click", () => {
          window.location.href = `/detail?id=${movie.id}`; // Ga naar de detailpagina
        });
        searchResults.appendChild(movieElement);
      });

      // Modal weergeven
      searchModal.style.display = "block";
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Zoeken wanneer de zoekknop wordt geklikt
  searchButton.addEventListener("click", searchMovies);

  // Zoeken wanneer de Enter-toets wordt ingedrukt in het zoekveld
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchMovies();
    }
  });

  // Sluit de modal wanneer de gebruiker op <span> (x) klikt
  const closeModal = document.getElementsByClassName("close")[0];
  closeModal.onclick = function () {
    searchModal.style.display = "none";
  };

  // Sluit de modal wanneer de gebruiker ergens buiten de modal klikt
  window.onclick = function (event) {
    if (event.target === searchModal) {
      searchModal.style.display = "none";
    }
  };
});
