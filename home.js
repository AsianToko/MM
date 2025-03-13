import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";

// import Swiper and modules styles
import "swiper/swiper.min.css";
import "swiper/modules/navigation.min.css";
import "swiper/modules/pagination.min.css";

const swiper = new Swiper(".swiper", {
  modules: [Navigation, Pagination],
  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
