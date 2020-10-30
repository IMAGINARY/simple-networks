import ready from 'document-ready';
import { Controller as NetworkController } from './ui/neural-network/controller';
import { Controller as SliderController } from './ui/slider/controller';
import { Controller as LevelController } from './ui/level/controller';

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

  const { model, inputs, training, layout, strings } = await loadLevel(levelUrl);

  const parent = document.createElement('div');
  parent.style.position = 'absolute';
  parent.style.top = '150px';
  parent.style.left = '100px';
  const oldSvg = document.querySelector('svg');
  oldSvg.parentElement.insertBefore(parent, oldSvg); // TODO: move to pug/CSS
  const networkController = new NetworkController(
    model,
    inputs,
    training.targetActivationFuncs,
    layout,
    parent
  );

  const inputNodeIds = model.network.inputNodeIds;
  const mapInputs = inputs => Object.fromEntries(inputNodeIds.map((id, i) => [id, inputs[i]]));
  const computeTargets = inputs => {
    const inputsMap = mapInputs(inputs);
    const targets = training.targetActivationFuncs.map(f => f(inputsMap));
    return targets;
  };
  const trainingTargets = training.inputs.map(computeTargets);

  const sliderController = new SliderController(levelNames);
  sliderController.on('current-slide-changed',
    (slideName, slideIndex) => console.log(`Go to slide ${slideIndex}: ${slideName}`)
  );

  const levelController = new LevelController(model, training.inputs, trainingTargets);
}

ready(main);
