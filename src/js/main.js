import {
  LevelController
} from './LevelController.js';


new LevelController();


var helping = false;
window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector("#helpme").onclick = () => {
    helping = !helping;
    if (helping) {
      document.querySelector(".helper").classList.add("visible");
      document.querySelector("#helpme").classList.add("selected");
    } else {
      document.querySelector(".helper").classList.remove("visible");
      document.querySelector("#helpme").classList.remove("selected");
    }
  };

});
