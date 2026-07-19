import { Check, Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SeriesCard({ series, progress, inList, favorite, onAdd, onFavorite, compact = false }) {
  return (
    <article className={`series-card ${compact ? 'compact' : ''}`}>
      <Link to={`/serie/${series.id}`} className="poster-wrap" aria-label={`Ver detalhes de ${series.title}`}>
        <img src={series.poster} alt={`Pôster de ${series.title}`} loading="lazy" />
        <div className="poster-shade" />
        <span className="rating-pill">★ {series.rating}</span>
        {inList && progress?.percent === 100 && <span className="complete-pill"><Check size={13} /> Completa</span>}
      </Link>
      <div className="series-card-body">
        <div className="card-title-row">
          <div>
            <Link to={`/serie/${series.id}`}><h3>{series.title}</h3></Link>
            <p>{series.year}{series.endYear ? `–${series.endYear}` : ''} · {series.genres[0]}</p>
          </div>
          {inList && (
            <button className={`heart-button ${favorite ? 'selected' : ''}`} onClick={() => onFavorite(series.id)} aria-label="Alternar favorito">
              <Heart size={19} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        {inList ? (
          <div className="progress-block">
            <div className="progress-copy">
              <span>{progress.remaining === 0 ? 'Você está em dia' : `${progress.remaining} episódios restantes`}</span>
              <strong>{progress.percent}%</strong>
            </div>
            <div className="progress-track"><span style={{ width: `${progress.percent}%`, background: series.accent }} /></div>
          </div>
        ) : (
          <button className="add-button" onClick={() => onAdd(series)}><Plus size={18} /> Adicionar à lista</button>
        )}
      </div>
    </article>
  );
}
