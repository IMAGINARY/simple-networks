import ready from 'document-ready';
import { Controller as NetworkController } from './ui/neural-network/controller';
import { Controller as SliderController } from './ui/slider/controller';
import { Controller as LevelController } from './ui/level/controller';

import { YAMLLoader } from './util/yaml-loader';
import { load as loadLevel } from './file-formats/load-level';
import { load as loadConfig } from './file-formats/load-config';
import { AsyncFunctionQueue } from './util/async-function-queue';

class SequentialLevelLoader {
  constructor() {
    this._dummyDisposeLevel = () => true;
    this._disposeLevel = this._dummyDisposeLevel;
    this._asyncFunctionQueue = new AsyncFunctionQueue();
  }

  static async preload(...levels) {
    const preloadSingle = async (level) => await SequentialLevelLoader._loadNonUI(level);
    const promises = levels.map(preloadSingle);
    return (await Promise.allSettled(promises)).map((o, i) => ({ level: levels[i], outcome: o }));
  }

  async load(level) {
    // this serves as a barrier such that on one level is loading at a time
    return await this._asyncFunctionQueue.enqueue(async () => await this._load(level));
  }

  static async _loadNonUI({ name, url }) {
    const levelObj = await YAMLLoader.fromUrl(url);
    return loadLevel({ object: levelObj, name, url });
  }

  static _loadUI({ model, inputs, training, layout, strings }) {
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

    return { networkController, levelController };
  }

  async _load({ name, url }) {
    // dispose the old level
    this._disposeLevel();
    this._disposeLevel = () => true;

    const { networkController, levelController } = SequentialLevelLoader._loadUI(
      await SequentialLevelLoader._loadNonUI({ name, url })
    );

    // set new level disposer for when the next level is loaded
    this._disposeLevel = () => {
      networkController.dispose();
      levelController.dispose();
    };

    return true;
  }
}

function processPreloadResults(levelPreloadResults) {
  const warn = ({ level: { name }, outcome: { reason } }) => {
    console.warn(`Unable to preload level '${name}'.`, reason);
  };
  levelPreloadResults
    .filter(r => r.outcome.status === 'rejected')
    .forEach(warn);
}

async function main() {
  const parent = document.createElement('div');
  parent.id = 'network-container';
  parent.style.position = 'absolute';
  parent.style.top = '150px';
  parent.style.left = '100px';
  const oldSvg = document.querySelector('svg');
  oldSvg.parentElement.insertBefore(parent, oldSvg); // TODO: move to pug/CSS

  const configUrl = new URL('/assets/config/default.yaml', window.location.href);
  const configObj = await YAMLLoader.fromUrl(configUrl);
  const { levels, defaultLanguage } = loadConfig(configObj, configUrl);

  console.log(configUrl, configObj, levels);
  SequentialLevelLoader.preload(...levels).then(processPreloadResults);

  const levelLoader = new SequentialLevelLoader();
  const sliderController = new SliderController(levels.map(({ name, url }) => name));
  sliderController.on('current-slide-changed', (_, i) => levelLoader.load(levels[i]));
  await levelLoader.load(levels[sliderController.getModel().getCurrentSlideIndex()]);
}

ready(main);
