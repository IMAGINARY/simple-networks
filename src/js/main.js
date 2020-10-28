import View from './neural-network-mvc/view';
import Controller from './neural-network-mvc/controller';
import { load as loadLevel } from './level/load';

function rand(min, max) {
  return Math.random() * (max - min) - min;
}

async function main() {
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

main();
