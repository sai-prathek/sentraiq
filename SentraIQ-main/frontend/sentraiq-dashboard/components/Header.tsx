import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-200/60 shadow-sm transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link
            to="/"
            className="flex items-center gap-4 cursor-pointer group"
            title="Back to Landing Page"
        >
          <div className="bg-gray-900 px-4 py-2 rounded-lg group-hover:opacity-90 transition-opacity shadow-sm">
            <img
              src="https://www.infoseck2k.com/wp-content/themes/infoseck/images/infosec-logo.png"
              alt="InfoSec K2K"
              className="h-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">SentraIQ</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-900">
                Evidence Lakehouse
            </p>
          </div>
        </Link>

      </div>
    </header>
  );
};

export default Header;