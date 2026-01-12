import React, { useEffect, useState } from 'react';
import { Database, FileText, Link as LinkIcon, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardStats } from '../types';
import { api } from '../services/api';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  delayIndex: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, delayIndex }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Simple count up animation
    let start = 0;
    const end = value;
    if (start === end) return;
    
    // Duration based on magnitude but capped
    const totalDuration = 1500; 
    const incrementTime = (totalDuration / end) > 20 ? 20 : (totalDuration / end);
    
    // For large numbers, jump by larger increments
    const step = Math.ceil(end / (totalDuration / 20));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayIndex * 0.1, duration: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full group-hover:from-purple-100 group-hover:to-pink-100 transition-colors">
          <div className="text-purple-600 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
          {displayValue.toLocaleString()}
        </h3>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
        
        {/* Decorative Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "70%" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
            />
        </div>
      </div>
    </motion.div>
  );
};

const StatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (e) {
      console.error("Failed to load stats:", e);
      // Set to null to show loading state on error
      setStats(null);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-pulse">
          {[1,2,3,4].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
          ))}
      </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <StatCard 
        label="Total Logs" 
        value={stats.total_logs} 
        icon={<Database className="w-6 h-6" />} 
        delayIndex={0} 
      />
      <StatCard 
        label="Total Documents" 
        value={stats.total_documents} 
        icon={<FileText className="w-6 h-6" />} 
        delayIndex={1} 
      />
      <StatCard 
        label="Evidence Objects" 
        value={stats.total_evidence_objects} 
        icon={<LinkIcon className="w-6 h-6" />} 
        delayIndex={2} 
      />
      <StatCard 
        label="Assurance Packs" 
        value={stats.total_assurance_packs} 
        icon={<Box className="w-6 h-6" />} 
        delayIndex={3} 
      />
    </div>
  );
};

export default StatsDashboard;