import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthBar() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserEmail(session?.user?.email || null);
    });
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email || null);
    })();
    return () => { sub.data.subscription.unsubscribe(); };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setEmail(''); setPassword('');
      setMode('login');
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Registro iniciado. Revisa tu correo para verificar la cuenta.');
      setMode('login');
    } catch (err: any) {
      setError(err?.message || 'Error al registrarse');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const redirectTo = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      alert('Te enviamos un correo para restablecer la contraseña');
      setMode('login');
    } catch (err: any) {
      setError(err?.message || 'Error al enviar recuperación');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex items-center gap-4">
      {userEmail ? (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{userEmail}</p>
            <p className="text-xs text-gray-500">Sesión activa</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                required
              />
              <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Log in</button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                required
              />
              <button type="submit" className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">Registrarse</button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                required
              />
              <button type="submit" className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700">Recuperar</button>
            </form>
          )}

          <div className="flex items-center gap-1">
            <button onClick={() => setMode('login')} className={`text-xs px-2 py-1 rounded ${mode==='login'?'bg-blue-50 text-blue-700':'text-gray-600 hover:bg-gray-100'}`}>Log in</button>
            <button onClick={() => setMode('signup')} className={`text-xs px-2 py-1 rounded ${mode==='signup'?'bg-green-50 text-green-700':'text-gray-600 hover:bg-gray-100'}`}>Registrarse</button>
            <button onClick={() => setMode('reset')} className={`text-xs px-2 py-1 rounded ${mode==='reset'?'bg-orange-50 text-orange-700':'text-gray-600 hover:bg-gray-100'}`}>Olvidé mi contraseña</button>
          </div>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      )}
    </div>
  );
}