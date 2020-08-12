import {
  LevelController
} from './LevelController.js';


new LevelController();



window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector("#helpmebutton").onclick = () => {
    document.querySelector(".helper").classList.add("visible");
    document.querySelector(".mission").classList.remove("visible");
    document.querySelector("#helpmebutton").classList.add("selected");
    document.querySelector("#missionbutton").classList.remove("selected");
  };
  
  document.querySelector("#missionbutton").onclick = () => {
    document.querySelector(".helper").classList.remove("visible");
    document.querySelector(".mission").classList.add("visible");
    document.querySelector("#helpmebutton").classList.remove("selected");
    document.querySelector("#missionbutton").classList.add("selected");
  };
/* FIXME: There is no #creditsbutton id, so why is this code here if it breaks anyway?
  document.querySelector("#creditsbutton").onclick = () => {
    document.querySelector(".credits").classList.toggle("visible");
    document.querySelector("#screenoverlay").classList.toggle("visible");
    document.querySelector("#creditsbutton").classList.toggle("selected");
  };
*/
  document.querySelector("#screenoverlay").onclick = () => {
    document.querySelector(".credits").classList.remove("visible");
    document.querySelector("#screenoverlay").classList.remove("visible");
    document.querySelector("#creditsbutton").classList.remove("selected");
  };
});
