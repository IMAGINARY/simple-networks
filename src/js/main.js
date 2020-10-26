import View from './neural-network-mvc/view';
import Controller from './neural-network-mvc/controller';
import { load as loadLevel } from './level/load';

function main() {
  //new LevelController();


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
    /* FIXME: There is no #creditsbutton linear, so why is this code here if it breaks anyway?
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
}

function rand(min, max) {
  return Math.random() * (max - min) - min;
}

async function mainMaxModel() {
  const levelUrl = new URL('assets/levels/Max.yaml', window.location.href);
  const { model, layout, training, strings } = await loadLevel(levelUrl);
  const network = model.network;

  for (let i = 0; i < training.inputs.length; ++i) {
    const inputs = training.inputs[i];
    const inputsMap = Object.fromEntries(network.inputNodes.map(({ id }, i) => [id, inputs[i]]));
    const targets = training.targetActivationFuncs.map(f => f(inputsMap));
    model.train(inputs, targets, 0.1);
  }

  model.assignInputs(network.inputNodes.map(n => n.p.input));
  model.clamp();
  model.feedForward();

  const parent = document.createElement('div');
  parent.style.position = 'absolute';
  parent.style.top = '150px';
  parent.style.left = '100px';
  const oldSvg = document.querySelector('svg');
  oldSvg.parentElement.insertBefore(parent, oldSvg); // TODO: move to pug/CSS
  const view = new View(model, layout, parent);
  const controller = new Controller(model, training.targetActivationFuncs, view);
}

mainMaxModel();
//main();
