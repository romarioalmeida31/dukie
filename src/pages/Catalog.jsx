import { AlertCircle, LoaderCircle, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SeriesCard from '../components/SeriesCard';

export default function Catalog({ store, tmdb, favoritesOnly = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(store.catalog);
  const [searching, setSearching] = useState(false);
  const favoriteResults = useMemo(() => store.mySeries.filter((series) => store.isFavorite(series.id)), [store]);
  const filtered = favoritesOnly ? favoriteResults.filter((series) => series.title.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))) : results;

  useEffect(() => {
    if (favoritesOnly) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      tmdb.search(query, controller.signal)
        .then(setResults)
        .catch((error) => { if (error.name !== 'AbortError') setResults([]); })
        .finally(() => setSearching(false));
    }, query ? 350 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [favoritesOnly, query, tmdb.search]);

  return (
    <div className="page catalog-page">
      <div className="catalog-heading">
        <div><p className="eyebrow">{favoritesOnly ? 'SUA SELEÇÃO' : 'DESCUBRA ALGO NOVO'}</p><h1>{favoritesOnly ? 'Favoritos' : 'Explorar catálogo'}</h1><p>{favoritesOnly ? 'Os títulos que ganharam um lugar especial.' : 'Encontre sua próxima história e acompanhe cada episódio.'}</p></div>
        <Sparkles className="heading-sparkle" size={40} />
      </div>
      <div className="catalog-search">
        {searching ? <LoaderCircle className="spin" size={20} /> : <Search size={20} />}
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por título ou gênero..." autoFocus={!favoritesOnly} />
        <button aria-label="Filtros"><SlidersHorizontal size={19} /></button>
      </div>
      {!tmdb.configured && !favoritesOnly && <div className="api-notice"><AlertCircle size={17} /><span>Configure <code>VITE_TMDB_ACCESS_TOKEN</code> ou <code>VITE_TMDB_API_KEY</code> no arquivo <code>.env</code> para carregar o catálogo do TMDB.</span></div>}
      {tmdb.error && !favoritesOnly && <div className="api-notice error"><AlertCircle size={17} /><span>{tmdb.error} Verifique o token e tente novamente.</span></div>}
      <div className="results-row"><h2>{query ? `Resultados para “${query}”` : favoritesOnly ? 'Seus favoritos' : 'Populares agora'}</h2><span>{filtered.length} {filtered.length === 1 ? 'série' : 'séries'}</span></div>
      {filtered.length ? (
        <div className="series-grid catalog-grid">
          {filtered.map((series) => <SeriesCard key={series.id} series={series} inList={store.isInList(series.id)} progress={store.getProgress(series.id)} favorite={store.isFavorite(series.id)} onAdd={store.addSeries} onFavorite={store.toggleFavorite} />)}
        </div>
      ) : (
        <div className="empty-state"><Search size={34} /><h3>Nenhuma série encontrada</h3><p>Tente buscar por outro título ou gênero.</p></div>
      )}
    </div>
  );
}
