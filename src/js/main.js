import ready from 'document-ready';
import * as langmap from 'langmap';

import { Controller as NetworkController } from './ui/neural-network/controller';
import { Controller as SliderController } from './ui/slider/controller';
import { Controller as LevelController } from './ui/level/controller';

import { YAMLLoader } from './util/yaml-loader';
import createI18N from './util/i18n';
import { load as loadLevel } from './file-formats/load-level';
import { load as loadConfig } from './file-formats/load-config';
import { AsyncFunctionQueue } from './util/async-function-queue';

class SequentialLevelLoader {
  constructor(i18n) {
    this._i18n = i18n;
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
    return { name, url, ...loadLevel({ object: levelObj, name, url }) };
  }

  _loadUI({ name, model, inputs, training, layout, strings }) {
    this._i18n.addLevelStrings(name, strings);
    const networkParentElem = document.querySelector('#network-container');
    const networkController = new NetworkController({
        levelName: name,
        networkModel: model,
        inputs,
        targetActivationFuncs: training.targetActivationFuncs,
        layout,
        parentElem: networkParentElem,
        strings,
        i18n: this._i18n,
      }
    );

    const inputNodeIds = model.network.inputNodeIds;
    const mapInputs = inputs => Object.fromEntries(inputNodeIds.map((id, i) => [id, inputs[i]]));
    const computeTargets = inputs => {
      const inputsMap = mapInputs(inputs);
      const targets = training.targetActivationFuncs.map(f => f(inputsMap));
      return targets;
    };
    const trainingTargets = training.inputs.map(computeTargets);

    const levelController = new LevelController({
      networkModel: model,
      trainingInputs: training.inputs,
      trainingTargets,
      i18n: this._i18n,
    });

    return { networkController, levelController };
  }

  async _load({ name, url }) {
    // dispose the old level
    this._disposeLevel();
    this._disposeLevel = () => true;

    const { networkController, levelController } = this._loadUI(
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

function setupLanguageSelector(i18n, supportedLanguages) {
  const i18next = i18n.getI18NextInstance();
  const currentLng = i18next.language;

  const languageSelector = document.querySelector('#language-selector');
  supportedLanguages.forEach(lng => {
    const name = langmap[lng].nativeName;
    const option = document.createElement('option');
    option.value = lng;
    option.innerText = name;
    languageSelector.appendChild(option);
  });
  languageSelector.value = currentLng;

  const localizeMain = () => i18n.localize('.footer, .train .trainingdata, .train .helper');

  const handleLanguageChange = async (lng) => {
    await i18next.changeLanguage(lng);
    localizeMain();
  };

  languageSelector.addEventListener('change',
    async (event) => await handleLanguageChange(event.target.value)
  );

  i18next.on('languageChanged', (lng) => {
    if (lng !== currentLng) {
      const url = new URL(window.location.href);
      const urlSearchParams = new URLSearchParams(url.search);
      if (urlSearchParams.has('lang')) {
        urlSearchParams.set('lang', lng);
        url.search = urlSearchParams.toString();
        window.history.pushState({ path: url.href }, '', url.href);
      }
    }
  });

  localizeMain();
}

async function main() {
  const parent = document.createElement('div');
  parent.id = 'network-container';
  parent.style.position = 'absolute';
  parent.style.top = '150px';
  parent.style.left = '100px';
  const oldSvg = document.querySelector('svg');
  oldSvg.parentElement.insertBefore(parent, oldSvg); // TODO: move to pug/CSS

  const configUrl = new URL('./assets/config/default.yaml', window.location.href);
  const configObj = await YAMLLoader.fromUrl(configUrl);
  const { levels, languages } = loadConfig(configObj, configUrl);

  const i18n = await createI18N(languages, true);
  setupLanguageSelector(i18n, languages);

  SequentialLevelLoader.preload(...levels).then(processPreloadResults);
  const levelLoader = new SequentialLevelLoader(i18n);
  const sliderController = new SliderController(levels.map(({ name, url }) => name));
  sliderController.on('current-slide-changed', (_, i) => levelLoader.load(levels[i]));
  await levelLoader.load(levels[sliderController.getModel().getCurrentSlideIndex()]);
}

ready(main);
