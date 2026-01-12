import React from 'react';

const Loading = ({ isOpen, text = 'Processing...' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold">{text}</p>
      </div>
    </div>
  );
};

export default Loading;
