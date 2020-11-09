import fetchWithCache from './fetch-with-cache';
import jsYaml from 'js-yaml';

export default class YAMLLoader {
  static async fromUrl(url, cache = true) {
    const response = await (cache ? fetchWithCache(url.href) : fetch(url.href));
    const levelSrc = await response.text();
    return YAMLLoader.fromString(levelSrc);
  }

  static fromString(s) {
    return jsYaml.safeLoad(s);
  }
}

export { YAMLLoader };
