import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, User, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/remitos';

  const handleSubmit = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Ingrese usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('Sesión iniciada correctamente');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-stroke rounded-xl shadow-sm p-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-brand text-white font-bold text-xl mb-3 shadow-sm">
            P
          </div>
          <h1 className="text-2xl font-bold text-content-primary tracking-tight">Premier Web</h1>
          <p className="text-content-secondary text-xs mt-1">Gestión Centralizada de Remitos y Unidades</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e.nativeEvent)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-primary uppercase tracking-wider mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-content-secondary pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. lucas"
                disabled={loading}
                className="w-full pl-9 pr-3 py-2 bg-white border border-stroke rounded-md text-sm text-content-primary placeholder-content-disabled focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light transition-colors duration-150 disabled:bg-surface-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-primary uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-content-secondary pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-9 pr-3 py-2 bg-white border border-stroke rounded-md text-sm text-content-primary placeholder-content-disabled focus:outline-none focus:border-brand-hover focus:ring-1 focus:ring-brand-light transition-colors duration-150 disabled:bg-surface-secondary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-hover hover:bg-brand-pressed active:bg-brand-pressed text-white font-medium text-sm rounded-md transition-colors duration-150 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;