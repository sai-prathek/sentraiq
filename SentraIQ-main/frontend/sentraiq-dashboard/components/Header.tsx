import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Activity } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-200/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link
            to="/"
            className="flex items-center gap-3 cursor-pointer group"
            title="Back to Landing Page"
        >
          <div className="bg-gradient-to-tr from-purple-600 to-pink-600 p-2 rounded-lg shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">SentraIQ</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Evidence Lakehouse
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
            <div className="bg-gray-900 px-3 py-1.5 rounded-lg">
              <img
                src="https://www.infoseck2k.com/wp-content/themes/infoseck/images/infosec-logo.png"
                alt="InfoSec K2K"
                className="h-7 object-contain"
              />
            </div>
          </div>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
            <a 
                href="/docs" 
                target="_blank"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
            >
                API Docs <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100 shadow-sm">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </div>
                <span className="text-xs font-semibold text-green-700">System Online</span>
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;