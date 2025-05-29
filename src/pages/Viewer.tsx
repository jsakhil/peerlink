import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Peer from 'peerjs';

const Viewer: React.FC = () => {
  const [broadcasterId, setBroadcasterId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const connectToBroadcaster = async () => {
    if (!broadcasterId) {
      alert('Please enter the broadcaster\'s Peer ID');
      return;
    }

    try {
      // Create a new peer with a random ID
      const peer = new Peer();
      peerRef.current = peer;

      peer.on('open', () => {
        console.log('Viewer peer opened with ID:', peer.id);
        
        // Create a call to the broadcaster with an empty stream
        const call = peer.call(broadcasterId, new MediaStream(), { metadata: { type: 'viewer' } });
        console.log('Call initiated to broadcaster:', broadcasterId);
        
        call.on('stream', (remoteStream) => {
          console.log('Received stream from broadcaster');
          if (videoRef.current) {
            // Set the stream to the video element
            videoRef.current.srcObject = remoteStream;
            
            // Configure video element
            videoRef.current.muted = false;
            videoRef.current.volume = 1;
            videoRef.current.autoplay = true;
            videoRef.current.playsInline = true;
            
            // Play the video
            videoRef.current.play()
              .then(() => {
                console.log('Video playback started successfully');
                setIsConnected(true);
              })
              .catch(err => {
                console.error('Error playing video:', err);
                alert('Error playing video stream');
              });
          }
        });

        call.on('close', () => {
          console.log('Call closed');
          setIsConnected(false);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        });

        call.on('error', (err) => {
          console.error('Call error:', err);
          alert('Error connecting to broadcaster');
          setIsConnected(false);
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        alert('Error connecting to broadcaster');
        setIsConnected(false);
      });

    } catch (error) {
      console.error('Error creating peer:', error);
      alert('Error connecting to broadcaster');
    }
  };

  const disconnect = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setIsConnected(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Viewer</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg mb-4 bg-black"
            style={{ minHeight: '400px' }}
          />

          <div className="space-y-4">
            {!isConnected ? (
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={broadcasterId}
                  onChange={(e) => setBroadcasterId(e.target.value)}
                  placeholder="Enter Broadcaster's Peer ID"
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={connectToBroadcaster}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Connect
                </button>
              </div>
            ) : (
              <button
                onClick={disconnect}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewer; 