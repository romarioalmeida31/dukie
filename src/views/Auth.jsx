import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Tv2, UserRound } from 'lucide-react';
import { useState } from 'react';

const benefits = ['Organize todas as suas séries', 'Acompanhe episódios e temporadas', 'Descubra quanto tempo você assistiu'];

export default function Auth({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (mode === 'register' && form.name.trim().length < 2) return setError('Informe seu nome.');
    if (form.password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');
    setSubmitting(true);
    try {
      await (mode === 'login' ? onLogin(form) : onRegister(form));
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-brand"><span className="brand-mark"><Tv2 size={23} /></span><span>DUKIE</span></div>
        <div className="auth-pitch">
          <p className="eyebrow">SEU TEMPO. SUAS HISTÓRIAS.</p>
          <h1>Nunca mais perca<br />um episódio.</h1>
          <p>Acompanhe suas séries favoritas, marque o que já assistiu e descubra quanto tempo passou em grandes histórias.</p>
          <div className="auth-benefits">
            {benefits.map((benefit) => <span key={benefit}><i><Check size={14} /></i>{benefit}</span>)}
          </div>
        </div>
        <p className="tmdb-credit">Dados de séries fornecidos por TMDB</p>
        <div className="auth-orb one" /><div className="auth-orb two" />
      </section>

      <section className="auth-form-side">
        <div className="auth-mobile-brand"><span className="brand-mark"><Tv2 size={21} /></span><span>DUKIE</span></div>
        <div className="auth-card">
          <header>
            <p className="eyebrow">{mode === 'login' ? 'BEM-VINDO DE VOLTA' : 'COMECE AGORA'}</p>
            <h2>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h2>
            <p>{mode === 'login' ? 'Continue acompanhando suas histórias.' : 'Sua biblioteca pessoal começa aqui.'}</p>
          </header>
          <div className="auth-switch" role="tablist">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Entrar</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>Criar conta</button>
          </div>
          <form onSubmit={submit}>
            {mode === 'register' && <label><span>Nome</span><div className="auth-input"><UserRound size={18} /><input value={form.name} onChange={update('name')} placeholder="Como podemos chamar você?" autoComplete="name" required /></div></label>}
            <label><span>E-mail</span><div className="auth-input"><Mail size={18} /><input type="email" value={form.email} onChange={update('email')} placeholder="voce@exemplo.com" autoComplete="email" required /></div></label>
            <label><span>Senha</span><div className="auth-input"><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Mínimo de 6 caracteres" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" disabled={submitting}>{submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar na Dukie' : 'Criar minha conta'}{!submitting && <ArrowRight size={18} />}</button>
          </form>
          <p className="auth-local-note"><LockKeyhole size={13} /> Conta local: seus dados permanecem neste navegador.</p>
        </div>
      </section>
    </main>
  );
}
