import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Peer from 'peerjs';
import { IoHome } from 'react-icons/io5';
import { IoCopy } from 'react-icons/io5';
import { IoEye } from 'react-icons/io5';

interface Viewer {
  id: string;
  stream: MediaStream;
}

const getViewerWidthClass = (totalViewers: number) => {
  if (totalViewers === 1) return 'w-full';
  if (totalViewers === 2) return 'w-[calc(50%-6px)]';
  if (totalViewers === 3) return 'w-[calc(33.333%-8px)]';
  return 'w-[calc(25%-8px)]';
};

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
          call.answer(streamRef.current);
          console.log('Answered call with stream to peer:', call.peer);

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
    <div className="min-h-screen bg-gray-100 p-8 relative">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-screen h-screen object-cover min-h-screen"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      <div className="max-w-full min-h-[calc(100vh-4rem)] relative z-10 flex justify-between">
        <div className='w-full md:w-[40%] lg:w-[30%] xl:w-[25%] md:max-w-[420px] min-h-[calc(100vh-4rem)] h-full flex flex-col justify-between'>
          <div className='header'>
            <div className="flex justify-start items-center mb-8">
              <button
                onClick={() => navigate('/')}
                className="bg-white/10 text-white p-2 hover:bg-white/20 backdrop-blur-sm mr-4"
              >
                <IoHome className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-white">Broadcaster</h1>
            </div>
          </div>

          <div className='actions'>
            <div className="space-y-4">
              {!isStreaming ? (
                <button
                  onClick={startBroadcasting}
                  className="w-full bg-indigo-900 text-white py-3 px-6 hover:bg-blue-700"
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
                      className="flex-1 p-2 border"
                      placeholder="Your Peer ID will appear here"
                    />
                    <button
                      onClick={copyPeerId}
                      className="bg-green-600 text-white p-2 hover:bg-green-700"
                      title='Copy ID'
                    >
                      <IoCopy className="w-6 h-6" />
                    </button>
                  </div>
                  <button
                    onClick={stopBroadcasting}
                    className="w-full bg-red-600 text-white py-3 px-6 hover:bg-red-700"
                  >
                    End Broadcasting
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-[40%] lg:w-[30%] xl:w-[25%] min-h-[calc(100vh-4rem)] hidden md:flex flex-wrap gap-3">
          {viewers.map((viewer) => (
            <div
              key={viewer.id}
              className={`relative bg-black/50 overflow-hidden backdrop-blur-sm aspect-video ${getViewerWidthClass(viewers.length)} flex-auto`}
            >
              <video
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover bg-black"
                ref={(el) => {
                  if (el) el.srcObject = viewer.stream;
                }}
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 backdrop-blur-sm">
                Viewer {viewer.id.slice(0, 4)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewers.length > 0 && (
        <div className="block md:hidden bg-white/10 text-white p-2 backdrop-blur-sm fixed top-[50%] right-[2rem]">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IoEye className="w-8 h-8" />
            <span>{viewers.length}</span>
          </h2>
        </div>
      )}
    </div>
  );
};

export default Broadcaster; 