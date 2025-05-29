import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Peer from 'peerjs';

interface Viewer {
  id: string;
  stream: MediaStream;
}

const Broadcaster: React.FC = () => {
  const [peerId, setPeerId] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const startBroadcasting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      const peer = new Peer();
      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('Broadcaster peer opened with ID:', id);
        setPeerId(id);
        setIsStreaming(true);
      });

      peer.on('call', (call) => {
        console.log('Received call from:', call.peer);
        
        if (!streamRef.current) {
          console.error('No stream available to share');
          return;
        }

        try {
          // Answer the call with our stream
          call.answer(streamRef.current);
          console.log('Answered call with stream to peer:', call.peer);
          
          // Handle the viewer's stream
          call.on('stream', (viewerStream) => {
            console.log('Received stream from viewer:', call.peer);
            setViewers(prev => {
              if (!prev.find(v => v.id === call.peer)) {
                return [...prev, { id: call.peer, stream: viewerStream }];
              }
              return prev;
            });
          });

          call.on('close', () => {
            console.log('Call closed with peer:', call.peer);
            setViewers(prev => prev.filter(v => v.id !== call.peer));
          });

          call.on('error', (err) => {
            console.error('Call error with peer:', call.peer, err);
            setViewers(prev => prev.filter(v => v.id !== call.peer));
          });

        } catch (error) {
          console.error('Error answering call:', error);
          alert('Error connecting to viewer');
        }
      });

      peer.on('error', (err) => {
        console.error('Broadcaster peer error:', err);
        alert('Error in peer connection');
      });

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Error accessing camera and microphone');
    }
  };

  const stopBroadcasting = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setPeerId('');
    setViewers([]);
  };

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    alert('Peer ID copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Broadcaster</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-black"
                style={{ minHeight: '300px' }}
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                You (Broadcaster)
              </div>
            </div>
            {viewers.map((viewer) => (
              <div key={viewer.id} className="relative">
                <video
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg bg-black"
                  style={{ minHeight: '300px' }}
                  ref={(el) => {
                    if (el) el.srcObject = viewer.stream;
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                  Viewer {viewer.id.slice(0, 4)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            {!isStreaming ? (
              <button
                onClick={startBroadcasting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
              >
                Start Broadcasting
              </button>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={peerId}
                    readOnly
                    className="flex-1 p-2 border rounded"
                    placeholder="Your Peer ID will appear here"
                  />
                  <button
                    onClick={copyPeerId}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Copy ID
                  </button>
                </div>
                <button
                  onClick={stopBroadcasting}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700"
                >
                  Stop Broadcasting
                </button>
              </>
            )}
          </div>
        </div>

        {viewers.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Connected Viewers ({viewers.length})</h2>
            <div className="space-y-2">
              {viewers.map((viewer) => (
                <div key={viewer.id} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">{viewer.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Broadcaster; 