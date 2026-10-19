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
    return `inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors duration-150 cursor-pointer ${
      active
        ? 'bg-brand text-white shadow-sm'
        : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
    }`;
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      {/* Header fijo/sticky */}
      <header className="bg-surface border-b border-stroke sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo y Enlaces */}
            <div className="flex items-center gap-6">
              <div 
                onClick={() => navigate('/remitos')}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <img 
                  src="/public/logoBroalLayout.png" 
                  alt="Broal Motos Logo" 
                  className="h-10 w-auto object-contain cursor-pointer" 
                />
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

            {/* Usuario y Logout */}
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-content-secondary hover:text-brand-dark hover:bg-brand-soft rounded-md transition-colors duration-150 cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main con padding inferior amplio (pb-24) para que el footer no tape tablas/formularios */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        <Outlet />
      </main>

      {/* Footer fijado siempre a la vista */}
      <footer className="fixed bottom-0 inset-x-0 bg-surface border-t border-stroke py-6 text-center text-xs text-content-secondary z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        Broal Motos &copy; 2026 &mdash; Sistema de Control Interno y Remitos
      </footer>
    </div>
  );
};

export default MainLayout;