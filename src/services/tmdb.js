const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p';
const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const apiKey = import.meta.env.VITE_TMDB_API_KEY;

export const isTmdbConfigured = Boolean(token || apiKey);

const placeholder = (width, height, label) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#17131f"/><stop offset="1" stop-color="#090a0d"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" fill="#706581" font-family="system-ui,sans-serif" font-size="24" text-anchor="middle">${label}</text></svg>`)}`;

const fallbackPoster = placeholder(500, 750, 'Dukie');
const fallbackBanner = placeholder(1600, 900, 'Dukie');

async function request(path, params = {}, signal) {
  if (!token && !apiKey) throw new Error('TMDB_CREDENTIALS_MISSING');
  const query = new URLSearchParams({
    language: 'pt-BR',
    ...params,
    ...(apiKey && !token ? { api_key: apiKey } : {}),
  });
  const response = await fetch(`${API_URL}${path}?${query}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      accept: 'application/json',
    },
    signal,
  });
  if (!response.ok) {
    const error = new Error(`TMDB_REQUEST_FAILED_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function image(path, size, fallback) {
  return path ? `${IMAGE_URL}/${size}${path}` : fallback;
}

function normalizeSummary(item, genres = []) {
  const genreNames = item.genres?.map((genre) => genre.name)
    || item.genre_ids?.map((id) => genres.find((genre) => genre.id === id)?.name).filter(Boolean)
    || [];
  return {
    id: `tmdb-${item.id}`,
    tmdbId: item.id,
    title: item.name || item.original_name,
    year: Number((item.first_air_date || '').slice(0, 4)) || '—',
    endYear: item.last_air_date ? Number(item.last_air_date.slice(0, 4)) : undefined,
    genres: genreNames.length ? genreNames : ['Série'],
    rating: Number(item.vote_average || 0).toFixed(1),
    status: ['Ended', 'Canceled'].includes(item.status) ? 'finished' : 'ongoing',
    accent: '#8b5cf6',
    synopsis: item.overview || 'Sinopse ainda não disponível em português.',
    poster: image(item.poster_path, 'w500', fallbackPoster),
    banner: image(item.backdrop_path, 'original', fallbackBanner),
    seasons: [],
    source: 'tmdb',
  };
}

let genreCache;
async function getGenres(signal) {
  if (genreCache) return genreCache;
  const data = await request('/genre/tv/list', {}, signal);
  genreCache = data.genres || [];
  return genreCache;
}

export async function getTrendingSeries(signal) {
  const [data, genres] = await Promise.all([
    request('/trending/tv/week', {}, signal),
    getGenres(signal),
  ]);
  return data.results.filter((item) => item.poster_path).map((item) => normalizeSummary(item, genres));
}

export async function searchSeries(query, signal) {
  if (!query.trim()) return getTrendingSeries(signal);
  const [data, genres] = await Promise.all([
    request('/search/tv', { query: query.trim(), include_adult: 'false' }, signal),
    getGenres(signal),
  ]);
  return data.results.filter((item) => item.poster_path).map((item) => normalizeSummary(item, genres));
}

export async function getSeriesDetails(tmdbId, signal) {
  const data = await request(`/tv/${tmdbId}`, {}, signal);
  const validSeasons = (data.seasons || []).filter((season) => season.season_number > 0);
  const seasons = await Promise.all(
    validSeasons.map(async (season) => {
      const details = await request(`/tv/${tmdbId}/season/${season.season_number}`, {}, signal);
      return {
        number: season.season_number,
        episodes: (details.episodes || []).map((episode) => ({
          number: episode.episode_number,
          title: episode.name || `Episódio ${episode.episode_number}`,
          airDate: episode.air_date,
          duration: episode.runtime || data.episode_run_time?.[0] || 45,
          still: image(episode.still_path, 'w300', null),
        })),
      };
    }),
  );
  return { ...normalizeSummary(data), seasons };
}
