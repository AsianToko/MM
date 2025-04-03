document.getElementById("profile-pic").addEventListener("click", function () {
  document.getElementById("profile-input").click();
});

document
  .getElementById("profile-input")
  .addEventListener("change", function () {
    document.getElementById("profile-form").submit();
  });

  
