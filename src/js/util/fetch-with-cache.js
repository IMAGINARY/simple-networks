const cache = new Map();

export default async function fetchWithCache(href) {
  if (cache.has(href)) {
    const response = await cache.get(href);
    if (!response.ok) {
      cache.delete(href);
    }
    return response.clone();
  } else {
    const fetcher = fetch(href);
    cache.set(href, fetcher);
    return await fetchWithCache(href);
  }
}

export { fetchWithCache };
