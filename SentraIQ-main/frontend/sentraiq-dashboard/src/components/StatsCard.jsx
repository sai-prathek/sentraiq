import React, { useEffect, useState } from 'react';

const StatsCard = ({ icon: Icon, label, value, color = 'purple' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const increment = (end - start) / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      setDisplayValue(Math.round(start + increment * current));

      if (current >= steps) {
        setDisplayValue(end);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const gradientColors = {
    purple: 'from-purple-600 to-pink-600',
    blue: 'from-blue-600 to-cyan-600',
    green: 'from-green-600 to-emerald-600',
    orange: 'from-orange-600 to-red-600',
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradientColors[color]} flex items-center justify-center text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-4xl font-bold bg-gradient-to-r ${gradientColors[color]} bg-clip-text text-transparent`}>
          {displayValue}
        </span>
      </div>
      <p className="text-gray-600 text-sm font-medium mb-3">{label}</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${Math.min(100, (displayValue / 10) * 100)}%` }}></div>
      </div>
    </div>
  );
};

export default StatsCard;
