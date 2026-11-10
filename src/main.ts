import { Router } from "./router.js";
import { Carousel } from "./carousel.js";

const carousel = new Carousel("#carousel", {
    interval: 5000,
    showControls: true,
    showIndicator: true,
    loop: true,
});

window.addEventListener("route:rendered", (event) => {
    const { path } = (event as CustomEvent<{ path: string }>).detail;

    if (path === "/") { carousel.init(); }
    else { carousel.destroy(); }
});

const router = new Router("#main-page-container");

router.Start();