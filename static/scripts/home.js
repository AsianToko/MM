const swiper = new Swiper(".swiper", {
    slidesPerView: 4,
    spaceBetween: 5,
    centeredSlides: true,
    roundLengths: true,
    loop: true, // creates a infinite loop of slides
    navigation: {
      // activate navigation with navigation buttons
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      // activate paginations
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
  
    // keyboard and mousewheel navigation
    keyboard: true,
    mousewheel: false,
  });