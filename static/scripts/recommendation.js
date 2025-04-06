console.log("hall");

document.querySelectorAll('input[name="genre[]"]').forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    document.getElementById("form").submit();
  });
});

  const filmCheckbox = document.getElementById('genre_film');
  const serieCheckbox = document.getElementById('genre_serie');
  const genreOptions = document.getElementById('genre_options');
  const genreTitle = document.getElementById('genre_title');
  
  function toggleGenres() {
    if (filmCheckbox.checked || serieCheckbox.checked) {
      genreOptions.style.display = 'flex'; 
      genreTitle.style.display = 'block';
    } else {
      genreOptions.style.display = 'none';
      genreTitle.style.display = 'none';
    }
  }

  toggleGenres();
  filmCheckbox.addEventListener('change', toggleGenres);
  serieCheckbox.addEventListener('change', toggleGenres);
  




ratingSlider.addEventListener("input", () => {
  ratingValue.textContent = ratingSlider.value;
});

ratingSlider.addEventListener("change", () => {
  // Update verborgen input met huidige slider-waarde
  document.getElementById("minRating").value = ratingSlider.value;
  document.getElementById("form").submit();
});

  // Zet bij pagina-laden de juiste waarde in het label
  ratingValue.textContent = ratingSlider.value;