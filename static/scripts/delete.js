document.querySelectorAll(".delete-button").forEach((button) => {
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    const movieId = button.dataset.id;

    const response = await fetch("/delete-movie", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ movieId }),
    });

    if (response.ok) {
      button.closest("li").remove(); // verwijder film uit UI
    } else {
      alert("Verwijderen mislukt.");
    }
  });
});
