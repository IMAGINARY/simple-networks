import ready from 'document-ready';
import { Controller as NetworkController } from './ui/neural-network/controller';
import { Controller as SliderController } from './ui/slider/controller';
import { Controller as LevelController } from './ui/level/controller';

import { YAMLLoader } from './util/yaml-loader';
import { load as loadLevel } from './file-formats/load-level';
import { AsyncFunctionQueue } from './util/async-function-queue';

const levelNames = [
  'TimesTwo',
  'Positive',
  'Sum',
  'PositiveOffsetToOne',
  'Average',
  'And',
  'CelsiusToFahrenheit',
  'Max',
  'Weather',
];

class SequentialLevelLoader {
  constructor() {
    this._dummyDisposeLevel = () => true;
    this._disposeLevel = this._dummyDisposeLevel;
    this._asyncFunctionQueue = new AsyncFunctionQueue();
  }

  async load(levelName) {
    // this serves as a barrier such that on one level is loading at a time
    return await this._asyncFunctionQueue.enqueue(async () => await this._load(levelName));
  }

  async _load(levelName) {
    // dispose the old level
    this._disposeLevel();
    this._disposeLevel = () => true;

    // FIXME: guard against custom URL injections
    const levelUrl = new URL(`assets/levels/${levelName}.yaml`, window.location.href);

    const levelObj = await YAMLLoader.fromUrl(levelUrl);
    const { model, inputs, training, layout, strings } = loadLevel(levelObj, levelUrl);

    const networkParentElem = document.querySelector('#network-container');
    const networkController = new NetworkController(
      model,
      inputs,
      training.targetActivationFuncs,
      layout,
      networkParentElem,
    );

    const inputNodeIds = model.network.inputNodeIds;
    const mapInputs = inputs => Object.fromEntries(inputNodeIds.map((id, i) => [id, inputs[i]]));
    const computeTargets = inputs => {
      const inputsMap = mapInputs(inputs);
      const targets = training.targetActivationFuncs.map(f => f(inputsMap));
      return targets;
    };
    const trainingTargets = training.inputs.map(computeTargets);

    const levelController = new LevelController(model, training.inputs, trainingTargets);

    // set new level disposer for when the next level is loaded
    this._disposeLevel = () => {
      networkController.dispose();
      levelController.dispose();
    };

    return true;
  }
}

async function main() {
  const parent = document.createElement('div');
  parent.id = 'network-container';
  parent.style.position = 'absolute';
  parent.style.top = '150px';
  parent.style.left = '100px';
  const oldSvg = document.querySelector('svg');
  oldSvg.parentElement.insertBefore(parent, oldSvg); // TODO: move to pug/CSS

  const levelLoader = new SequentialLevelLoader();
  const sliderController = new SliderController(levelNames);
  sliderController.on('current-slide-changed', (slideName) => levelLoader.load(slideName));
  await levelLoader.load(sliderController.getModel().getCurrentSlideName());
}

ready(main);
