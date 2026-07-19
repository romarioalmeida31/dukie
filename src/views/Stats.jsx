import { BarChart3, Clock3, Trophy, Tv2 } from 'lucide-react';

export default function Stats({ store }) {
  const ranked = [...store.mySeries].sort((a, b) => store.getProgress(b.id).watched - store.getProgress(a.id).watched);
  return (
    <div className="page stats-page">
      <div className="catalog-heading"><div><p className="eyebrow">SUA JORNADA</p><h1>Estatísticas</h1><p>Um retrato do tempo dedicado às suas histórias favoritas.</p></div><BarChart3 className="heading-sparkle" size={42} /></div>
      <div className="stats-summary">
        <div><Clock3 /><strong>{Math.floor(store.stats.minutes / 60)}h</strong><span>tempo assistido</span></div>
        <div><Tv2 /><strong>{store.stats.seriesCount}</strong><span>séries na lista</span></div>
        <div><Trophy /><strong>{ranked.filter((s) => store.getProgress(s.id).percent === 100).length}</strong><span>séries concluídas</span></div>
      </div>
      <section className="ranking"><p className="eyebrow">MAIS ASSISTIDAS</p><h2>Seu ranking</h2>{ranked.map((series, index) => { const progress = store.getProgress(series.id); return <div className="ranking-row" key={series.id}><span className="rank">{String(index + 1).padStart(2, '0')}</span><img src={series.poster} alt="" /><div><strong>{series.title}</strong><span>{progress.watched} episódios · {progress.percent}%</span></div><div className="mini-track"><span style={{ width: `${progress.percent}%`, background: series.accent }} /></div></div>; })}</section>
    </div>
  );
}
