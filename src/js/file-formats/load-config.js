import { Validator } from './validator';
import { normalizeAndStripBCP47Tag } from '../util/language-utils';

import { configSchema } from './config-schema';

const validate = Validator.createValidateFunction(configSchema);

export default function load(configObj, configUrl) {
  const { valid, errors } = validate(configObj);
  if (!valid) {
    console.error(errors);
    throw new Error(`Unable to validate config file ${configUrl.href}. Please check the developer console for details.`);
  }

  const result = ({ levels: processLevels(configObj.levels) });

  if (typeof configObj.defaultLanguage !== 'undefined') {
    result.defaultLanguage = processLanguageTag(configObj.defaultLanguage);
  }

  return result;
}

function processLevels(levelNames) {
  return levelNames.map(levelName => ({ name: levelName, url: convertLevelNameToUrl(levelName) }));
}

const levelBase = new URL('./assets/levels/', window.location.href).href;
const extension = 'yaml';

function convertLevelNameToUrl(name) {
  return new URL(`${name}.${extension}`, levelBase);
}

function processLanguageTag(tag) {
  return normalizeAndStripBCP47Tag(tag);
}

export { load };
