import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useDukieStore } from './hooks/useDukieStore';
import { useTmdbCatalog } from './hooks/useTmdbCatalog';
import { useAuth } from './hooks/useAuth';
import Auth from './views/Auth';
import Catalog from './views/Catalog';
import Dashboard from './views/Dashboard';
import SeriesDetails from './views/SeriesDetails';
import Stats from './views/Stats';

export default function App() {
  const auth = useAuth();
  if (!auth.user) return <Auth onLogin={auth.login} onRegister={auth.register} />;
  return <AuthenticatedApp key={auth.user.id} user={auth.user} onLogout={auth.logout} />;
}

function AuthenticatedApp({ user, onLogout }) {
  const tmdb = useTmdbCatalog();
  const store = useDukieStore(tmdb.catalog, user.id);
  return (
    <Layout user={user} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Dashboard store={store} />} />
        <Route path="/catalogo" element={<Catalog store={store} tmdb={tmdb} />} />
        <Route path="/favoritos" element={<Catalog store={store} tmdb={tmdb} favoritesOnly />} />
        <Route path="/estatisticas" element={<Stats store={store} />} />
        <Route path="/serie/:id" element={<SeriesDetails store={store} tmdb={tmdb} />} />
      </Routes>
    </Layout>
  );
}
