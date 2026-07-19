import { ArrowLeft, CalendarDays, Check, Clock3, Heart, LoaderCircle, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function SeriesDetails({ store, tmdb }) {
  const { id } = useParams();
  const summary = store.catalog.find((item) => item.id === id) || store.mySeries.find((item) => item.id === id);
  const [series, setSeries] = useState(summary);
  const [loading, setLoading] = useState(Boolean(summary?.source === 'tmdb' && !summary.seasons?.length));
  const [loadError, setLoadError] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState(summary?.seasons?.[0]?.number || 1);

  useEffect(() => {
    if (!id.startsWith('tmdb-') || series?.seasons?.length) return;
    const controller = new AbortController();
    setLoading(true);
    tmdb.loadDetails(id, controller.signal)
      .then((details) => {
        setSeries(details);
        setSeasonNumber(details.seasons[0]?.number || 1);
        if (store.isInList(id)) store.upsertSeries(details);
      })
      .catch((error) => { if (error.name !== 'AbortError') setLoadError(true); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id, series?.seasons?.length, store.isInList, store.upsertSeries, tmdb.loadDetails]);

  const season = useMemo(() => series?.seasons.find((item) => item.number === Number(seasonNumber)), [seasonNumber, series]);
  if (!series) return <div className="page not-found"><h1>Série não encontrada</h1><Link to="/">Voltar ao início</Link></div>;

  const progress = store.getProgress(id);
  const inList = store.isInList(id);
  const seasonWatched = season?.episodes.filter((episode) => store.isWatched(id, season.number, episode.number)).length || 0;

  return (
    <div className="details-page">
      <section className="hero" style={{ '--hero': `url(${series.banner})` }}>
        <div className="hero-overlay" />
        <div className="hero-inner">
          <Link to="/" className="back-link"><ArrowLeft size={18} /> Voltar</Link>
          <div className="hero-content">
            <img className="detail-poster" src={series.poster} alt={`Pôster de ${series.title}`} />
            <div className="hero-copy">
              <div className="hero-meta"><span className="status-dot">● {series.status === 'ongoing' ? 'EM EXIBIÇÃO' : 'FINALIZADA'}</span><span>{series.year}{series.endYear ? `–${series.endYear}` : ''}</span><span>•</span><span>{series.genres.join(' · ')}</span></div>
              <h1>{series.title}</h1>
              <div className="rating-row"><span><Star size={17} fill="currentColor" /> {series.rating}</span><span>IMDb</span><span>•</span><span>{progress.total} episódios</span></div>
              <p>{series.synopsis}</p>
              <div className="hero-actions">
                {inList ? (
                  <>
                    <button className="primary-button done"><Check size={19} /> Na minha lista</button>
                    <button className={`square-action ${store.isFavorite(id) ? 'favorite' : ''}`} onClick={() => store.toggleFavorite(id)} aria-label="Alternar favorito"><Heart size={20} fill={store.isFavorite(id) ? 'currentColor' : 'none'} /></button>
                    <button className="square-action" onClick={() => store.removeSeries(id)} aria-label="Remover da lista"><Trash2 size={19} /></button>
                  </>
                ) : <button className="primary-button" onClick={() => store.addSeries(series)}><Plus size={19} /> Adicionar à minha lista</button>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="episode-area">
        <div className="season-toolbar">
          <div><p className="eyebrow">GUIA DE EPISÓDIOS</p><h2>Episódios</h2></div>
        </div>
        {!!series.seasons.length && (
          <div className="season-picker" role="tablist" aria-label="Selecionar temporada">
            {series.seasons.map((item) => {
              const watched = item.episodes.filter((episode) => store.isWatched(id, item.number, episode.number)).length;
              const active = item.number === Number(seasonNumber);
              return (
                <button
                  key={item.number}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`season-option ${active ? 'active' : ''}`}
                  onClick={() => setSeasonNumber(item.number)}
                >
                  <span>T{String(item.number).padStart(2, '0')}</span>
                  <small>{watched}/{item.episodes.length}</small>
                </button>
              );
            })}
          </div>
        )}
        {loading ? <div className="details-loading"><LoaderCircle className="spin" /><strong>Carregando temporadas e episódios...</strong><span>Consultando o catálogo do TMDB</span></div> : loadError || !season ? <div className="empty-state"><h3>Não foi possível carregar os episódios</h3><p>Verifique seu token do TMDB e tente novamente.</p></div> : <>
        <div className="season-progress">
          <div><span>Progresso da temporada</span><strong>{seasonWatched} de {season.episodes.length} assistidos</strong></div>
          <div className="progress-track"><span style={{ width: `${(seasonWatched / season.episodes.length) * 100}%`, background: series.accent }} /></div>
        </div>
        <div className="episode-list">
          {season.episodes.map((episode) => {
            const watched = store.isWatched(id, season.number, episode.number);
            return (
              <button key={episode.number} className={`episode-row ${watched ? 'watched' : ''}`} onClick={() => { if (!inList) store.addSeries(id); store.toggleEpisode(id, season.number, episode.number); }}>
                <span className="episode-number">{String(episode.number).padStart(2, '0')}</span>
                <span className="episode-info"><strong>{episode.title}</strong><span><CalendarDays size={14} /> {dateFormatter.format(new Date(episode.airDate))}<i>•</i><Clock3 size={14} /> {episode.duration} min</span></span>
                <span className="watch-control"><span className="watch-copy">{watched ? 'Assistido' : 'Marcar como assistido'}</span><span className="check-box"><Check size={17} /></span></span>
              </button>
            );
          })}
        </div>
        </>}
      </section>
    </div>
  );
}
