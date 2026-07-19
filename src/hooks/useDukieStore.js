import { useCallback, useEffect, useMemo, useState } from 'react';
const storageKey = (userId) => `dukie:data:v2:${userId}`;
const starter = {
  list: [],
  favorites: [],
  watched: {},
  entities: {},
};

function loadData(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)));
    return saved && Array.isArray(saved.list) ? saved : starter;
  } catch {
    return starter;
  }
}

export function useDukieStore(catalog = [], userId) {
  const [data, setData] = useState(() => loadData(userId));

  const allSeries = useMemo(() => {
    const entries = [...Object.values(data.entities || {}), ...catalog];
    return Object.fromEntries(entries.map((series) => [series.id, series]));
  }, [catalog, data.entities]);

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(data));
  }, [data, userId]);

  const isWatched = useCallback(
    (seriesId, season, episode) => (data.watched[seriesId] || []).includes(`${season}-${episode}`),
    [data.watched],
  );

  const toggleEpisode = useCallback((seriesId, season, episode) => {
    const key = `${season}-${episode}`;
    setData((current) => {
      const watched = current.watched[seriesId] || [];
      return {
        ...current,
        watched: {
          ...current.watched,
          [seriesId]: watched.includes(key) ? watched.filter((item) => item !== key) : [...watched, key],
        },
      };
    });
  }, []);

  const addSeries = useCallback((seriesOrId) => {
    const series = typeof seriesOrId === 'string' ? allSeries[seriesOrId] : seriesOrId;
    const id = typeof seriesOrId === 'string' ? seriesOrId : seriesOrId.id;
    setData((current) => ({
      ...current,
      list: current.list.includes(id) ? current.list : [...current.list, id],
      entities: series?.source === 'tmdb' ? { ...(current.entities || {}), [id]: series } : current.entities,
    }));
  }, [allSeries]);

  const upsertSeries = useCallback((series) => {
    if (!series?.id || series.source !== 'tmdb') return;
    setData((current) => ({
      ...current,
      entities: { ...(current.entities || {}), [series.id]: series },
    }));
  }, []);

  const removeSeries = useCallback((id) => {
    setData((current) => ({
      ...current,
      list: current.list.filter((item) => item !== id),
      favorites: current.favorites.filter((item) => item !== id),
    }));
  }, []);

  const toggleFavorite = useCallback((id) => {
    setData((current) => ({
      ...current,
      favorites: current.favorites.includes(id)
        ? current.favorites.filter((item) => item !== id)
        : [...current.favorites, id],
    }));
  }, []);

  const getProgress = useCallback(
    (id) => {
      const series = allSeries[id];
      const total = series?.seasons.reduce((sum, season) => sum + season.episodes.length, 0) || 0;
      const watched = (data.watched[id] || []).length;
      return { total, watched, remaining: Math.max(total - watched, 0), percent: total ? Math.round((watched / total) * 100) : 0 };
    },
    [allSeries, data.watched],
  );

  const stats = useMemo(() => {
    let minutes = 0;
    let episodeCount = 0;
    data.list.forEach((id) => {
      const series = allSeries[id];
      if (!series) return;
      (data.watched[id] || []).forEach((key) => {
        const [seasonNumber, episodeNumber] = key.split('-').map(Number);
        const episode = series.seasons.find((season) => season.number === seasonNumber)?.episodes.find((item) => item.number === episodeNumber);
        if (episode) {
          minutes += episode.duration;
          episodeCount += 1;
        }
      });
    });
    return { minutes, episodeCount, seriesCount: data.list.length };
  }, [allSeries, data]);

  return {
    catalog,
    mySeries: data.list.map((id) => allSeries[id]).filter(Boolean),
    favorites: data.favorites,
    stats,
    isInList: (id) => data.list.includes(id),
    isFavorite: (id) => data.favorites.includes(id),
    isWatched,
    getProgress,
    toggleEpisode,
    addSeries,
    upsertSeries,
    removeSeries,
    toggleFavorite,
  };
}
