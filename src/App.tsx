import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Broadcaster from './pages/Broadcaster';
import Viewer from './pages/Viewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/broadcaster" element={<Broadcaster />} />
        <Route path="/viewer" element={<Viewer />} />
      </Routes>
    </Router>
  );
}

export default App;
