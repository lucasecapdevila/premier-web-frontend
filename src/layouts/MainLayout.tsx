import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, FileText } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'react-hot-toast';

export const MainLayout: React.FC = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sesión finalizada');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Corporativo */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            P
          </div>
          <div>
            <span className="font-semibold text-white tracking-wide">Premier</span>
            <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400 border border-blue-800">
              Web
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-blue-400 border-b-2 border-blue-500 pb-1">
            <FileText size={16} />
            <span>Remitos</span>
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Operador</div>
            <div className="text-sm font-medium text-white">{usuario?.operador || 'DESCONOCIDO'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Contenido Dinámico */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;