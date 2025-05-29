export interface PeerConnection {
  peerId: string;
  stream: MediaStream | null;
}

export interface BroadcasterState {
  peerId: string | null;
  stream: MediaStream | null;
  connections: PeerConnection[];
}

export interface ViewerState {
  peerId: string | null;
  stream: MediaStream | null;
  broadcasterId: string;
} 