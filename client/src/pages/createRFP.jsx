import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateRFP() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const suggestions = [
    "100 ergonomic mesh office chairs for the new branch",
    "A fleet of 5 delivery drones with 4K cameras",
    "Cloud storage migration services for 50TB of data"
  ];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return toast.error("Please describe what you need to buy.");
    
    setLoading(true);
    try {
      await axios.post('/api/rfps', { prompt });
      toast.success("RFP document compiled successfully.");
      navigate('/'); 
    } catch (err) {
      console.error(err);
      toast.error("System failed to generate RFP. Check the console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4 shadow-inner">
          <FileText className="text-blue-600" size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
          Procurement Request Generator
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          Enter your procurement requirements below. The system will automatically structure, calculate, and format a professional RFP document.
        </p>
      </div>
      <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-8 md:p-10 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <form onSubmit={handleGenerate} className="relative z-10">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
              Procurement Specifications
            </label>
            <textarea
              rows="5"
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-lg text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder-slate-400 shadow-inner"
              placeholder="e.g., We are outfitting a new office and need 50 standing desks, 50 dual-monitor arms, and a $10,000 budget. Target delivery is next quarter."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center text-sm font-semibold text-slate-500 mb-3">
              <Lightbulb size={16} className="mr-2 text-amber-500" /> 
              Quick Templates:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPrompt(suggestion)}
                  disabled={loading}
                  className="text-left text-sm bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center py-4 px-8 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-3" size={24} />
                Compiling Document...
              </>
            ) : (
              <>
                <ArrowRight className="mr-3 group-hover:translate-x-1 transition-transform" size={24} />
                Generate Official RFP
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}