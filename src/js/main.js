import ready from 'document-ready';

import { View as LevelView } from './ui/neural-network/view';
import { Controller as LevelController } from './ui/neural-network/controller';

import { Controller as SliderController } from './ui/slider/controller';

import { load as loadLevel } from './level-file-format/load';

const levelNames = [
  "TimesTwo",
  "Positive",
  "Sum",
  "PositiveOffsetToOne",
  "Average",
  "And",
  "CelsiusToFahrenheit",
  "Max",
  "Weather",
];

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
  const levelView = new LevelView(model, layout, parent);
  const levelController = new LevelController(model, training.targetActivationFuncs, levelView);

  const sliderController = new SliderController(levelNames);
  sliderController.on('current-slide-changed',
    (slideName, slideIndex) => console.log(`Go to slide ${slideIndex}: ${slideName}`)
  );
}

ready(main);
