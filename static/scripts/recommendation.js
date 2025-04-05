console.log("hall");

document.querySelectorAll('input[name="genre[]"]').forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    document.getElementById("form").submit();
  });
});