import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Video Conference App
        </h1>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/broadcaster')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Broadcasting
          </button>
          <button
            onClick={() => navigate('/viewer')}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Join as Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 