import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import Vendors from './pages/Vendors';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pb-12"> 
        <Toaster position="top-right" reverseOrder={false} /> 
        
        <Navbar /> 
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateRFP />} />
          <Route path="/vendors" element={<Vendors />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;