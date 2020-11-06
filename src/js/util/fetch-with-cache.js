const cache = new Map();

export default async function fetchWithCache(href) {
  if (cache.has(href)) {
    try {
      return (await cache.get(href)).clone();
    } catch (e) {
      cache.delete(href);
      throw e;
    }
  } else {
    const fetcher = fetch(href);
    cache.set(href, fetcher);
    return await fetchWithCache(href);
  }
}

export { fetchWithCache };
