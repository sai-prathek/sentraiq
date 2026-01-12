import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/95 border-b border-gray-200 shadow-md transition-all">
      <div className="w-full px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link
            to="/"
            className="flex items-center gap-5 cursor-pointer group"
            title="Back to Landing Page"
        >
          <div className="bg-gray-900 px-5 py-2.5 rounded-xl group-hover:opacity-90 group-hover:shadow-lg transition-all duration-200 shadow-md">
            <img
              src="https://www.infoseck2k.com/wp-content/themes/infoseck/images/infosec-logo.png"
              alt="InfoSec K2K"
              className="h-9 object-contain"
            />
          </div>
          <div className="flex flex-col justify-center gap-0.5">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight group-hover:text-blue-900 transition-colors">
              SentraIQ
            </h1>
            <p className="text-[11px] uppercase font-semibold tracking-[0.15em] text-blue-900 opacity-90">
              Evidence Lakehouse
            </p>
          </div>
        </Link>

        {/* Right: Navigation */}
        <nav className="flex items-center gap-3">
          <Link
            to="/business-overview"
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              isActive('/business-overview')
                ? 'text-white bg-blue-900 shadow-md'
                : 'text-gray-700 hover:text-blue-900 hover:bg-blue-50 active:bg-blue-100'
            }`}
          >
            Business Overview
          </Link>
        </nav>

      </div>
    </header>
  );
};

export default Header;