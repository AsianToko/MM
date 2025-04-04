// Hulp van ChatGPT
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const searchResults = document.getElementById("search-results");
  const searchModal = document.getElementById("search-modal");

  // Functie om te zoeken
  const search = async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
      // Fetch films en tv series
      const [moviesResponse, tvResponse] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&api_key=95220566adf8de17393bdcfb2a13f115`
        ),
        fetch(
          `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&language=en-US&api_key=95220566adf8de17393bdcfb2a13f115`
        ),
      ]);

      if (!moviesResponse.ok || !tvResponse.ok) {
        throw new Error("Error fetching search results.");
      }

      const moviesData = await moviesResponse.json();
      const tvData = await tvResponse.json();

      // vorige resultaten wissen
      searchResults.innerHTML = "";

      // toont film resultaten
      if (moviesData.results.length > 0) {
        const moviesHeader = document.createElement("h3");
        moviesHeader.textContent = "Movies";
        searchResults.appendChild(moviesHeader);

        moviesData.results.forEach((movie) => {
          const movieElement = document.createElement("div");
          movieElement.classList.add("movie-item");
          movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
          `;
          movieElement.addEventListener("click", () => {
            window.location.href = `/detail?id=${movie.id}`;
          });
          searchResults.appendChild(movieElement);
        });
      }

      // toont tv resultaten
      if (tvData.results.length > 0) {
        const tvHeader = document.createElement("h3");
        tvHeader.textContent = "TV Series";
        searchResults.appendChild(tvHeader);

        tvData.results.forEach((show) => {
          const tvElement = document.createElement("div");
          tvElement.classList.add("movie-item");
          tvElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name}" />
          `;
          tvElement.addEventListener("click", () => {
            window.location.href = `/detail?id=${show.id}`;
          });
          searchResults.appendChild(tvElement);
        });
      }

      // Toont een melding als er geen resultaten zijn
      searchModal.style.display = "block";
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Zoekfunctie aanroepen bij klikken op de zoekknop
  searchButton.addEventListener("click", search);

  // zoeken bij indrukken van de enter toets
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      search();
    }
  });

  // de zoekbalk sluiten waneer de gebruiker op de sluitknop klikt
  const closeModal = document.getElementsByClassName("close")[0];
  closeModal.onclick = function () {
    searchModal.style.display = "none";
  };

  // de zoekbal sluiten waneer de gebruiker buiten het zoekveld klikt
  window.onclick = function (event) {
    if (event.target === searchModal) {
      searchModal.style.display = "none";
    }
  };
});
