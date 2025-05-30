import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Peer from 'peerjs';
import { IoHome } from 'react-icons/io5';

const Viewer: React.FC = () => {
  const [broadcasterId, setBroadcasterId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
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
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = localStream;

      const peer = new Peer();
      peerRef.current = peer;

      peer.on('open', () => {
        console.log('Viewer peer opened with ID:', peer.id);

        const call = peer.call(broadcasterId, localStream, { metadata: { type: 'viewer' } });
        console.log('Call initiated to broadcaster:', broadcasterId);

        call.on('stream', (remoteStream) => {
          console.log('Received stream from broadcaster');
          if (videoRef.current) {
            videoRef.current.srcObject = remoteStream;
            videoRef.current.muted = false;
            videoRef.current.volume = 1;

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
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
          }
        });

        call.on('error', (err) => {
          console.error('Call error:', err);
          alert('Error connecting to broadcaster');
          setIsConnected(false);
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
          }
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        alert('Error connecting to broadcaster');
        setIsConnected(false);
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
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
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-100 p-8 relative">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          poster='/milkyway.webp'
          className="w-screen h-[100dvh] object-cover min-h-[100dvh]"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="max-w-full min-h-[calc(100dvh-4rem)] relative z-10 flex justify-between">
        <div className='w-full md:w-[40%] lg:w-[30%] xl:w-[25%] md:max-w-[420px] min-h-[calc(100dvh-4rem)] h-full flex flex-col justify-between'>
          <div className='header'>
            <div className="flex justify-start items-center mb-8">
              <button
                onClick={() => navigate('/')}
                className="bg-white/10 text-white p-2 hover:bg-white/20 backdrop-blur-sm mr-4"
              >
                <IoHome className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-white">Viewer</h1>
            </div>
          </div>

          <div className='actions'>
            <div className="space-y-4">
              {!isConnected ? (
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={broadcasterId}
                    onChange={(e) => setBroadcasterId(e.target.value)}
                    placeholder="Enter Broadcaster's Peer ID"
                    className="flex-1 p-2 border"
                  />
                  <button
                    onClick={connectToBroadcaster}
                    className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                  >
                    Connect
                  </button>
                </div>
              ) : (
                <button
                  onClick={disconnect}
                  className="w-full bg-red-600 text-white py-3 px-6 hover:bg-red-700"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Viewer; 