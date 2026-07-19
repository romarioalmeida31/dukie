import { BarChart3, Compass, Heart, LayoutGrid, LogOut, Search, Tv2 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Início', icon: LayoutGrid, end: true },
  { to: '/catalogo', label: 'Explorar', icon: Compass },
  { to: '/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/estatisticas', label: 'Estatísticas', icon: BarChart3 },
];

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate('/')} aria-label="Ir para o início">
          <span className="brand-mark"><Tv2 size={23} strokeWidth={2.5} /></span>
          <span>DUKIE</span>
        </button>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <p className="nav-label">MENU</p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">{user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
          <div className="account-copy"><strong>{user.name}</strong><span>{user.email}</span></div>
          <button className="logout-button" onClick={onLogout} aria-label="Sair da conta" title="Sair"><LogOut size={17} /></button>
        </div>
      </aside>

      <header className="mobile-header">
        <button className="brand" onClick={() => navigate('/')}><span className="brand-mark"><Tv2 size={19} /></span><span>DUKIE</span></button>
        <div className="mobile-actions"><button className="icon-button" onClick={() => navigate('/catalogo')} aria-label="Pesquisar"><Search size={20} /></button><button className="icon-button" onClick={onLogout} aria-label="Sair"><LogOut size={19} /></button></div>
      </header>

      <main className="app-content">{children}</main>

      <nav className="bottom-nav" aria-label="Navegação principal">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
