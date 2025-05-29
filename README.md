# Video Conference Application

A one-to-many video conferencing application built with React and WebRTC (PeerJS). This application allows one user to broadcast their video stream to multiple viewers without requiring a backend server.

## Features

- One-to-many video streaming
- Real-time video and audio communication
- Simple peer-to-peer connection using PeerJS
- Manual connection management through Peer IDs
- Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with WebRTC support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tnt-peerlink
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start:client
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Use

### As a Broadcaster

1. Click the "Start Broadcasting" button on the home page
2. Allow camera and microphone access when prompted
3. Once connected, you'll see your video stream and a Peer ID
4. Copy your Peer ID and share it with viewers
5. Viewers can connect using this Peer ID
6. Click "Stop Broadcasting" to end the stream

### As a Viewer

1. Click the "Join as Viewer" button on the home page
2. Paste the broadcaster's Peer ID into the input field
3. Click "Connect" to join the stream
4. You'll see the broadcaster's video stream once connected
5. Click "Disconnect" to leave the stream

## Technical Details

- Built with React and TypeScript
- Uses PeerJS for WebRTC implementation
- Styled with Tailwind CSS
- No backend required - all communication is peer-to-peer

## Browser Support

The application works best in modern browsers that support WebRTC:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Limitations

- Manual Peer ID exchange is required
- No chat functionality
- No screen sharing
- No recording capability

## Contributing

Feel free to submit issues and enhancement requests!
