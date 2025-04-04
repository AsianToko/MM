console.log("hall");
// document.querySelector(".checkbox").forEach((el) => el.addEventListener("click", refresh));
// const boxes = document.querySelectorAll(".checkbox");

// boxes.forEach(box => {
//   box.addEventListener("click", refresh);
// });

// function refresh() {
//   console.log("jjkldf");
//   document.getElementById("form").submit();
// }

document.querySelectorAll('input[name="genre[]"]').forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    document.getElementById("form").submit();
  });
});