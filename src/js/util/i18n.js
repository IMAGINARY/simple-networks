import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { default as HttpBackend } from 'i18next-http-backend';
import { uniq } from 'lodash';

import YAMLLoader from '../util/yaml-loader';

const escapeChars = '#.:_';
const mapping = Object.fromEntries([...escapeChars].map(cp => [cp, `#${cp.codePointAt(0)}`]));

class I18N {
  constructor(i18NextInstance) {
    this._instance = i18NextInstance;
  }

  getI18NextInstance() {
    return this._instance;
  }

  addLevelStrings(levelName, levelStrings) {
    const bundles = transformToI18NResourceBundles(levelStrings);
    for (let [lng, bundle] of Object.entries(bundles)) {
      const ns = I18N.levelNamespace(levelName);
      this._instance.addResourceBundle(lng, ns, bundle, true, true);
    }
  }

  static levelNamespace(levelName) {
    return `level_${levelName}`;
  }

  static escape(keyComponent) {
    return [...keyComponent].map(codepoint => mapping[codepoint] ?? codepoint).join('');
  }

  getFixedLevelT(levelName) {
    return this._instance.getFixedT(null, I18N.levelNamespace(levelName));
  }

  getFixedLevelLabelT(levelName) {
    const tLevel = this.getFixedLevelT(levelName);
    return (id, labelFor, ...args) => tLevel(`labels.${escape(id)}.${labelFor}`, ...args);
  }
}

export default async function createI18N(languages, preloadLanguages = false) {
  const detectorOptions = {
    lookupQuerystring: 'lang',
  };

  const httpBackendOptions = {
    loadPath: 'assets/locales/{{ns}}/{{lng}}.yaml',
    parse: YAMLLoader.fromString
  };

  const i18nextOptions = {
    preload: preloadLanguages ? languages : false,
    fallbackLng: uniq([...languages, 'en']),
    cleanCode: true,
    ns: ['main'],
    defaultNS: 'main',
    detection: detectorOptions,
    backend: httpBackendOptions,
  };

  const newInstance = i18next.createInstance();
  await newInstance
    .use(LanguageDetector)
    .use(HttpBackend)
    .init(i18nextOptions);

  return new I18N(newInstance);
}

function transformToI18NResourceBundles(strings) {
  const languages = occuringLanguages(strings);
  const bundles = Object.fromEntries(languages.map(l => [l, filterLanguage(strings, l)]));
  return bundles;
}

function occuringLanguages(strings) {
  const nodeOrEdgeLabelObjs = Object.values(strings?.labels ?? {});
  const propertyObjs = nodeOrEdgeLabelObjs.map(o => Object.values(o)).flat();
  const textObjs = propertyObjs.map(o => o.text ?? {});
  textObjs.push(strings?.title ?? {});
  textObjs.push(strings?.description ?? {});

  const languages = uniq(textObjs.map(o => Object.keys(o)).flat());

  return languages;
}

function filterLanguage(strings, lang) {
  const result = {};
  if (typeof strings?.title?.[lang] !== 'undefined') {
    result.title = strings?.title?.[lang];
  }
  if (typeof strings?.description?.[lang] !== 'undefined') {
    result.description = strings?.description?.[lang];
  }
  if (typeof strings?.labels !== 'undefined') {
    result.labels = {};
    Object.entries(strings.labels).forEach(([nodeOrEdgeId, labels]) => {
      const escapedId = escape(nodeOrEdgeId);
      result.labels[escapedId] = {};
      Object.entries(labels).forEach(([propertyName, propertyObj]) => {
        if (typeof propertyObj?.text?.[lang] !== 'undefined') {
          result.labels[escapedId][propertyName] = propertyObj?.text?.[lang];
        }
      });
    });
  }
  return result;
}

export { createI18N };
