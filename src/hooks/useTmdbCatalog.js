import { useCallback, useEffect, useRef, useState } from 'react';
import { getSeriesDetails, getTrendingSeries, isTmdbConfigured, searchSeries } from '../services/tmdb';

export function useTmdbCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(isTmdbConfigured);
  const [error, setError] = useState(null);
  const detailsCache = useRef(new Map());

  useEffect(() => {
    if (!isTmdbConfigured) return;
    const controller = new AbortController();
    getTrendingSeries(controller.signal)
      .then(setCatalog)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError('Não foi possível carregar o catálogo do TMDB.');
          setCatalog([]);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const search = useCallback(async (query, signal) => {
    if (!isTmdbConfigured) {
      return [];
    }
    return searchSeries(query, signal);
  }, []);

  const loadDetails = useCallback(async (id, signal) => {
    if (!id.startsWith('tmdb-')) return null;
    if (detailsCache.current.has(id)) return detailsCache.current.get(id);
    const details = await getSeriesDetails(id.replace('tmdb-', ''), signal);
    detailsCache.current.set(id, details);
    return details;
  }, []);

  return { catalog, loading, error, configured: isTmdbConfigured, search, loadDetails };
}
