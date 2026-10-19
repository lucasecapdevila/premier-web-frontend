import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FileText, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export const MainLayout: React.FC = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const navItemClass = (path: string): string => {
    const active = location.pathname.startsWith(path);
    return `inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors duration-150 ${
      active
        ? 'bg-[#FF0000] text-white shadow-sm'
        : 'text-[#666666] hover:text-[#1A1A1A] hover:bg-[#EAEAEA]'
    }`;
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      <header className="bg-white border-b border-stroke sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <div 
                onClick={() => navigate('/remitos')}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-brand flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
                  P
                </div>
                <div>
                  <span className="font-bold text-base tracking-tight text-content-primary block leading-none">
                    Premier<span className="text-brand-hover">Web</span>
                  </span>
                  <span className="text-[10px] text-content-secondary tracking-wide block uppercase font-medium">
                    Gestión de Remitos
                  </span>
                </div>
              </div>

              <nav className="hidden sm:flex items-center gap-1.5 ml-4">
                <button
                  type="button"
                  onClick={() => navigate('/remitos')}
                  className={navItemClass('/remitos')}
                >
                  <FileText size={15} />
                  <span>Remitos</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-content-primary">
                  {usuario?.operador ?? 'Operador'}
                </span>
                <span className="text-[10px] font-mono text-content-secondary">
                  ID: #{usuario?.id ?? '-'}
                </span>
              </div>

              <div className="h-5 w-px bg-stroke" />

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-content-secondary hover:text-[#991B1B] hover:bg-[#FEE2E2] rounded-md transition-colors duration-150"
                title="Cerrar sesión"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-stroke py-3 text-center text-xs text-content-secondary">
        Premier Motos &copy; 2026 &mdash; Sistema de Control Interno y Remitos
      </footer>
    </div>
  );
};

export default MainLayout;