import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 to-indigo-900">
      <div className='min-w-[75vw] relative'>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-left min-h-screen"
        >
          <source src="/6396302.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-black/90"></div>
      </div>
      <div className="min-h-screen bg-black/80 p-8 shadow-lg space-y-6 min-w-[25vw] flex flex-col">
        <div className='mb-8'>
          <h1 className="text-3xl font-bold text-center text-white/80 mb-2">PeerLink</h1>
          <small className='block w-full text-center text-gray-400'>Video Conference App</small>
        </div>
        <div className="space-y-4 flex-grow flex flex-col items-center justify-center min-w-[80%] m-auto">
          <button
            onClick={() => navigate('/broadcaster')}
            className="w-full bg-indigo-900 text-white py-3 px-6 hover:bg-blue-700 transition-colors"
          >
            Join as Broadcaster
          </button>
          <button
            onClick={() => navigate('/viewer')}
            className="w-full bg-slate-900 text-white py-3 px-6 hover:bg-green-700 transition-colors"
          >
            Join as Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 