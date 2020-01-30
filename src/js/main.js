import {
  LevelController
} from './LevelController.js';


new LevelController();



window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector("#helpmebutton").onclick = () => {
    document.querySelector(".helper").classList.toggle("visible");
    document.querySelector("#helpmebutton").classList.toggle("selected");
  };
  document.querySelector("#creditsbutton").onclick = () => {
    document.querySelector(".credits").classList.toggle("visible");
    document.querySelector("#screenoverlay").classList.toggle("visible");
    document.querySelector("#creditsbutton").classList.toggle("selected");
  };

  document.querySelector("#screenoverlay").onclick = () => {
    document.querySelector(".credits").classList.remove("visible");
    document.querySelector("#screenoverlay").classList.remove("visible");
    document.querySelector("#creditsbutton").classList.remove("selected");
  };
});
