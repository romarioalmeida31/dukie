import { Clock3, Play, Search, Tv2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeriesCard from '../components/SeriesCard';

function formatTime(totalMinutes) {
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

export default function Dashboard({ store }) {
  const [tab, setTab] = useState('ongoing');
  const navigate = useNavigate();
  const time = formatTime(store.stats.minutes);
  const visibleSeries = useMemo(
    () => store.mySeries.filter((series) => (tab === 'finished' ? store.getProgress(series.id).percent === 100 : store.getProgress(series.id).percent < 100)),
    [store, tab],
  );

  return (
    <div className="page dashboard-page">
      <section className="welcome-row">
        <div><p className="eyebrow">DOMINGO, 19 DE JULHO</p><h1>Olá, bem-vindo de volta.</h1><p>Continue de onde parou e mantenha tudo em dia.</p></div>
        <button className="search-trigger" onClick={() => navigate('/catalogo')}><Search size={19} /><span>Buscar séries...</span><kbd>⌘ K</kbd></button>
      </section>

      <section className="stats-grid">
        <div className="stat-card time-card">
          <div className="stat-icon purple"><Clock3 size={22} /></div>
          <div><p>Tempo total assistido</p><div className="time-value"><strong>{time.days}</strong><span>dias</span><strong>{time.hours}</strong><span>horas</span><strong>{time.minutes}</strong><span>min</span></div></div>
          <div className="stat-glow" />
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Play size={21} fill="currentColor" /></div>
          <div><p>Episódios assistidos</p><strong className="big-number">{store.stats.episodeCount}</strong><span className="muted-stat"> episódios marcados</span></div>
        </div>
        <div className="stat-card series-stat">
          <div className="stat-icon green"><Tv2 size={22} /></div>
          <div><p>Séries na sua lista</p><strong className="big-number">{store.stats.seriesCount}</strong><span className="muted-stat"> títulos acompanhados</span></div>
        </div>
      </section>

      <section className="library-section">
        <div className="section-heading">
          <div><p className="eyebrow">MINHA BIBLIOTECA</p><h2>Suas séries</h2></div>
          <button className="text-button" onClick={() => navigate('/catalogo')}>+ Adicionar série</button>
        </div>
        <div className="tabs" role="tablist">
          <button className={tab === 'ongoing' ? 'active' : ''} onClick={() => setTab('ongoing')}>Em andamento <span>{store.mySeries.filter((s) => store.getProgress(s.id).percent < 100).length}</span></button>
          <button className={tab === 'finished' ? 'active' : ''} onClick={() => setTab('finished')}>Finalizadas <span>{store.mySeries.filter((s) => store.getProgress(s.id).percent === 100).length}</span></button>
        </div>
        {visibleSeries.length ? (
          <div className="series-grid">
            {visibleSeries.map((series) => <SeriesCard key={series.id} series={series} progress={store.getProgress(series.id)} inList favorite={store.isFavorite(series.id)} onFavorite={store.toggleFavorite} />)}
          </div>
        ) : (
          <div className="empty-state"><Tv2 size={34} /><h3>Nada por aqui ainda</h3><p>Quando você concluir uma série, ela aparecerá nesta aba.</p></div>
        )}
      </section>
    </div>
  );
}
