import * as bcp47 from 'bcp-47';
import * as langmap from 'langmap';
import { isEqual } from 'lodash';

function normalizeAndStripBCP47Tag(tag) {
  let error = null;
  const bcp47Options = {
    normalize: true,
    forgiving: true,
    warning: (reason, code, offset) => error = ({ reason, code, offset }),
  };
  const bcp47Schema = bcp47.parse(tag, bcp47Options);
  if (bcp47Schema.language === null) {
    throw new Error(`Invalid BCP 47 language tag: ${tag}`);
  } else {
    const bcp47Tag = bcp47.stringify(bcp47Schema);
    if (error !== null) {
      console.warn(`Invalid BCP 47 language tag: ${tag}. Using partial tag ${bcp47Tag} instead.`);
    }

    const supportedSchemaProperties = ['language', 'region'];
    const { supported, unsupported } = splitBCP47Schema(bcp47Schema, supportedSchemaProperties);

    if (!isEqual(unsupported, {})) {
      console.warn(`Unsupported BCP 47 schema properties found in ${bcp47Tag}. Ignoring ${
        JSON.stringify(unsupported)}. Keeping only ${JSON.stringify(supported)}.`);
    }

    const strippedBCP47Tag = bcp47.stringify(supported);
    if (typeof langmap[strippedBCP47Tag] === 'undefined') {
      throw new Error(`Unsupported BCP 47 language tag ${strippedBCP47Tag}`);
    }

    return strippedBCP47Tag;
  }
}

const emptySchema = bcp47.parse('');

function splitBCP47Schema(schema, supportedProperties) {
  const entries = Object.entries(schema);
  const isValueEmpty = (key, value) => isEqual(emptySchema[key], value);
  const isKeySupported = key => supportedProperties.includes(key);
  const filterSupported = ([key, value]) => isKeySupported(key) && !isValueEmpty(key, value);
  const filterUnsupported = ([key, value]) => !isKeySupported(key) && !isValueEmpty(key, value);
  const supportedEntries = entries.filter(filterSupported);
  const unsupportedEntries = entries.filter(filterUnsupported);
  return {
    supported: Object.fromEntries(supportedEntries),
    unsupported: Object.fromEntries(unsupportedEntries),
  };
}

export { normalizeAndStripBCP47Tag };
