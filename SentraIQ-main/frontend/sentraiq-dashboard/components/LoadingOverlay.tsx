import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Processing...' }) => {
  return (
    <div className="absolute inset-0 z-40 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-purple-600" />
        </motion.div>
        <span className="text-gray-700 font-medium">{message}</span>
      </motion.div>
    </div>
  );
};

export default LoadingOverlay;