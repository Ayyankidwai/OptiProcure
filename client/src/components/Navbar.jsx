import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, PlusCircle, Users, Box } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm mb-8 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"> 
        <div className="flex items-center space-x-6">
          {showBackButton && (          //left side back button 
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-blue-600 flex items-center transition-colors font-bold text-sm bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={16} className="mr-2" /> Back
            </button>
          )}
          
          <Link to="/" className="flex items-center text-xl font-black text-gray-800 hover:text-blue-600 transition-colors tracking-tight">
            <Box className="text-blue-600 mr-2" size={24} />
            OptiProcure
          </Link>
        </div> 
        <div className="flex items-center space-x-6">
          <Link         //Right side navigation links
            to="/" 
            className={`flex items-center font-semibold transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            <Home size={18} className="mr-1" /> Dashboard
          </Link>
          
          <Link 
            to="/vendors" 
            className={`flex items-center font-semibold transition-colors ${location.pathname === '/vendors' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            <Users size={18} className="mr-1" /> Vendors
          </Link>
          
          <Link 
            to="/create" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusCircle size={18} className="mr-2" /> New RFP
          </Link>
        </div>

      </div>
    </nav>
  );
}