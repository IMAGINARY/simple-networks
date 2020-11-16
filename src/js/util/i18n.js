import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { default as HttpBackend } from 'i18next-http-backend';
import { uniq } from 'lodash';

import YAMLLoader from '../util/yaml-loader';

const escapeChars = '#.:_';
const mapping = Object.fromEntries([...escapeChars].map(cp => [cp, `#${cp.codePointAt(0)}`]));

const defaultNumberFormatOptions = {
  notation: 'standard',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

class I18N {
  constructor(i18NextInstance) {
    this._instance = i18NextInstance;
    this._localize = locI18next.init(i18NextInstance);
  }

  getI18NextInstance() {
    return this._instance;
  }

  addLevelStrings(levelName, levelStrings) {
    const bundles = transformToI18NResourceBundles(levelStrings);
    for (let [lng, bundle] of Object.entries(bundles)) {
      const ns = levelNamespace(levelName);
      this._instance.addResourceBundle(lng, ns, bundle, true, true);
    }
  }

  getFixedLevelT(levelName) {
    return this._instance.getFixedT(null, levelNamespace(levelName));
  }

  getFixedLevelLabelT(levelName) {
    const tLevel = this.getFixedLevelT(levelName);
    return (id, labelFor, ...args) => tLevel(`labels.${escape(id)}.${labelFor}`, ...args);
  }

  localize(...selectorsAndElems) {
    selectorsAndElems.forEach(e => this._localize(e));
  }

  getNumberFormatter(options = defaultNumberFormatOptions) {
    const formatter = new Intl.NumberFormat(this._instance.language, options);
    return formatter.format.bind(formatter);
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

  languages.forEach(lng => newInstance.addResource(lng, 'internal', 'empty', ''));

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
          const escapedPropertyName = escape(propertyName);
          result.labels[escapedId][escapedPropertyName] = propertyObj?.text?.[lang];
        }
      });
    });
  }
  return result;
}

function levelNamespace(levelName) {
  return `level_${escape(levelName)}`;
}

function escape(keyComponent) {
  return [...keyComponent].map(codepoint => mapping[codepoint] ?? codepoint).join('');
}

function _key(ns, ...keyParts) {
  return `${ns}:${keyParts.join('.')}`;
}

function key(ns, ...keyParts) {
  return _key(ns, ...keyParts.map(escape));
}

function levelKey(levelName, ...keyParts) {
  return _key(levelNamespace(levelName), ...keyParts);
}

export { createI18N, escape, levelNamespace, key, levelKey };


// copy of locI18next package until passing elements to localize() is implemented upstream
const locI18nextDefaults = {
  selectorAttr: 'data-i18n',
  targetAttr: 'i18n-target',
  optionsAttr: 'i18n-options',
  useOptionsAttr: false,
  parseDefaultValueFromContent: true,
  document: document,
};

function locI18nextInit(i18next, options = {}) {
  options = { ...locI18nextDefaults, ...options };
  var extendDefault = (o, val) => options.parseDefaultValueFromContent
    ? { ...o, ...{ defaultValue: val } } : o;

  function parse(elem, key, opts) {
    var attr = 'text';

    if (key.indexOf('[') == 0) {
      var parts = key.split(']');
      key = parts[1];
      attr = parts[0].substr(1, parts[0].length - 1);
    }

    key = key.indexOf(';') == key.length - 1
      ? key.substr(0, key.length - 2)
      : key;

    if (attr === 'html') {
      elem.innerHTML = i18next.t(key, extendDefault(opts, elem.innerHTML));
    } else if (attr === 'text') {
      elem.textContent = i18next.t(key, extendDefault(opts, elem.textContent));
    } else if (attr === 'prepend') {
      let startIdx = elem.innerHTML.indexOf('<loc-i18n>');
      let endIdx = elem.innerHTML.indexOf('</loc-i18n>') + 11;
      if (startIdx > -1 && endIdx > 6) {
        elem.innerHTML = [elem.innerHTML.substring(0, startIdx), elem.innerHTML.slice(endIdx)].join(
          '')
      }
      elem.innerHTML = ['<loc-i18n>', i18next.t(key, extendDefault(opts, elem.innerHTML)),
                        '</loc-i18n>', elem.innerHTML].join('');
    } else if (attr === 'append') {
      let startIdx = elem.innerHTML.indexOf('<loc-i18n>');
      let endIdx = elem.innerHTML.indexOf('</loc-i18n>') + 11;
      if (startIdx > -1 && endIdx > 6) {
        elem.innerHTML = [elem.innerHTML.substring(0, startIdx), elem.innerHTML.slice(endIdx)].join(
          '')
      }
      elem.innerHTML = [elem.innerHTML, '<loc-i18n>', i18next.t(key,
        extendDefault(opts, elem.innerHTML),
        '</loc-i18n>')].join('');
    } else if (attr.indexOf('data-') === 0) {
      let dataAttr = attr.substr('data-'.length);
      let translated = i18next.t(key, extendDefault(opts, elem.getAttribute(dataAttr)));
      // we change into the data cache
      elem.setAttribute(dataAttr, translated);
      // we change into the dom
      elem.setAttribute(attr, translated);
    } else {
      elem.setAttribute(attr, i18next.t(key, extendDefault(opts, elem.getAttribute(attr))));
    }
  };

  function relaxedJsonParse(badJSON) {
    return JSON.parse(badJSON
      .replace(/:\s*"([^"]*)"/g, function (match, p1) {
        return ': "' + p1.replace(/:/g, '@colon@') + '"';
      })
      .replace(/:\s*'([^']*)'/g, function (match, p1) {
        return ': "' + p1.replace(/:/g, '@colon@') + '"';
      })
      .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ')
      .replace(/@colon@/g, ':'));
  }

  function _loc(elem, opts) {
    var key = elem.getAttribute(options.selectorAttr);
    //        if (!key && typeof key !== 'undefined' && key !== false)
    //            key = elem.textContent || elem.innerHTML;
    if (!key) return;

    var target = elem,
      targetSelector = elem.getAttribute(options.targetAttr);

    if (targetSelector != null)
      target = elem.querySelector(targetSelector) || elem;

    if (!opts && options.useOptionsAttr === true)
      opts = relaxedJsonParse(elem.getAttribute(options.optionsAttr) || '{}');

    opts = opts || {};

    if (key.indexOf(';') >= 0) {
      let keys = key.split(';');
      for (let ix = 0, l_ix = keys.length; ix < l_ix; ix++) {
        if (keys[ix] != '') parse(target, keys[ix], opts);
      }
    } else {
      parse(target, key, opts);
    }

    if (options.useOptionsAttr === true) {
      let clone = {};
      clone = { clone, ...opts };
      delete clone.lng;
      elem.setAttribute(options.optionsAttr, JSON.stringify(clone));
    }
  }

  function handle(selector, opts) {
    let elems;
    if (typeof selector === 'string') {
      elems = options.document.querySelectorAll(selector);
    } else if (typeof selector?.[Symbol.iterator] !== 'function') {
      // not iterable -> wrap in iterable
      elems = [selector];
    } else {
      // is iterable
      elems = selector;
    }

    for (let elem of elems) {
      let childs = elem.querySelectorAll('[' + options.selectorAttr + ']');
      for (let j = childs.length - 1; j > -1; j--) {
        _loc(childs[j], opts);
      }
      _loc(elem, opts);
    }
  };
  return handle;
}

const locI18next = { init: locI18nextInit };
