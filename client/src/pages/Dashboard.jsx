import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Calendar, DollarSign, ExternalLink, Loader2, Trash2, Send, X, MessageSquare, Scale, Award, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [rfps, setRfps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);

  // Filter State
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [sendModalId, setSendModalId] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [sending, setSending] = useState(false);

  const [simulateModalId, setSimulateModalId] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [simulateForm, setSimulateForm] = useState({ vendorEmail: '', emailBody: '' });

  const [evalModalId, setEvalModalId] = useState(null);
  const [evalData, setEvalData] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rfpRes, vendorRes] = await Promise.all([
          axios.get('/api/rfps'),
          axios.get('/api/vendors')
        ]);
        setRfps(Array.isArray(rfpRes.data) ? rfpRes.data : (rfpRes.data?.rfps || []));
        setVendors(vendorRes.data || []);
      } catch (err) {
        setError("Failed to load dashboard data. Check if server is running.");
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this RFP?")) return;
    try {
      await axios.delete(`/api/rfps/${id}`);
      setRfps(prev => prev.filter(rfp => rfp._id !== id));
      toast.success("RFP deleted successfully!");
    } catch (err) {
      toast.error("Could not delete the RFP.");
    }
  };

  const handleSendRFP = async () => {
    if (selectedEmails.length === 0) return toast.error("Select at least one vendor!");
    setSending(true);
    try {
      await axios.post(`/api/rfps/${sendModalId}/send`, { vendorEmails: selectedEmails });
      setRfps(prev => prev.map(rfp => rfp._id === sendModalId ? { ...rfp, status: 'Sent' } : rfp));
      setSendModalId(null);
      setSelectedEmails([]);
      toast.success("RFP sent successfully to vendors!");
    } catch (err) {
      toast.error("Failed to send emails.");
    } finally {
      setSending(false);
    }
  };

  const toggleEmailSelection = (email) => {
    setSelectedEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const handleSimulateReply = async () => {
    if (!simulateForm.vendorEmail || !simulateForm.emailBody) return toast.error("Please fill in both fields.");
    setParsing(true);
    try {
      await axios.post('/api/proposals/parse', {
        rfpId: simulateModalId,
        vendorEmail: simulateForm.vendorEmail,
        emailBody: simulateForm.emailBody
      });
      toast.success("Success! AI parsed the email and saved the proposal.");
      setRfps(prev => prev.map(rfp => rfp._id === simulateModalId ? { ...rfp, proposalCount: (rfp.proposalCount || 0) + 1 } : rfp));
      setSimulateModalId(null);
      setSimulateForm({ vendorEmail: '', emailBody: '' });
    } catch (err) {
      toast.error("Failed to parse the email.");
    } finally {
      setParsing(false);
    }
  };

  const handleEvaluate = async (rfpId) => {
    setEvalModalId(rfpId);
    setEvaluating(true);
    setEvalData(null); 
    try {
      const res = await axios.get(`/api/rfps/${rfpId}/evaluate`);
      setEvalData(res.data);
      toast.success("AI Evaluation Complete!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to evaluate proposals.");
      setEvalModalId(null);
    } finally {
      setEvaluating(false);
    }
  };

  const filteredRfps = rfps.filter(rfp => {
    if (statusFilter === 'All') return true;
    const currentStatus = rfp.status || 'Draft';
    return currentStatus === statusFilter;
  });

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 relative"> 
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FileText className="mr-3 text-blue-600" /> Dashboard
        </h1>
      </div>
      <div className="flex items-center space-x-2 mb-8 bg-white p-2 rounded-lg border border-gray-200 inline-flex shadow-sm">
        <Filter className="text-gray-400 mx-2" size={18} />
        {['All', 'Draft', 'Sent'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              statusFilter === status 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredRfps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No RFPs found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredRfps.map((rfp) => (
            <div key={rfp._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <h2 className="text-lg font-extrabold text-slate-800 leading-snug line-clamp-2">
                    {rfp.title}
                  </h2>
                  <span className={`flex-shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    rfp.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rfp.status || 'Draft'}
                  </span>
                </div>  
                {/* MIDDLE SECTION: Budget & Deadline Boxes */}
                <div className="space-y-2 mb-2 mt-4">
                  <div className="flex items-center text-sm text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-lg shadow-sm">
                    <DollarSign size={16} className="mr-3 text-emerald-600 stroke-[2.5]" />
                    <span className="font-semibold truncate">{rfp.budget || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-lg shadow-sm">
                    <Calendar size={16} className="mr-3 text-orange-500 stroke-[2.5]" />
                    <span className="font-medium truncate">Due: {rfp.deadline || "Not set"}</span>
                  </div>
                </div>
              </div>
              {/* BOTTOM SECTION: Actions Footer */}
              <div className="border-t border-slate-200 bg-slate-50/80 px-5 py-3 flex justify-between items-center mt-auto">
                {/* Proposal Badge */}
                <div className="flex items-center">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${
                    rfp.proposalCount > 0 
                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}>
                    {rfp.proposalCount || 0} Proposals
                  </span>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center space-x-0.5">
                  <button onClick={() => handleEvaluate(rfp._id)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-100 rounded-full transition-all" title="Compare Proposals">
                    <Scale size={18} />
                  </button>
                  <button onClick={() => setSimulateModalId(rfp._id)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded-full transition-all" title="Simulate Vendor Reply">
                    <MessageSquare size={18} />
                  </button>
                  <button onClick={() => setSendModalId(rfp._id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all" title="Send to Vendors">
                    <Send size={18} />
                  </button>
                  <button onClick={() => handleDelete(rfp._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-all" title="Delete RFP">
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="w-px h-5 bg-slate-300 mx-1.5"></div> {/* Vertical Divider Line */}
                  
                  <button onClick={() => setExpandedId(expandedId === rfp._id ? null : rfp._id)} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center ml-1 px-2 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                    {expandedId === rfp._id ? "Hide" : "Details"} <ExternalLink size={14} className="ml-1" />
                  </button>
                </div>
              </div>
              {/* EXPANDED DETAILS SECTION */}
              {expandedId === rfp._id && (
                <div className="bg-slate-800 p-5 border-t border-slate-700 text-white shadow-inner animate-in slide-in-from-top-2 duration-200">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Requested Items</h3>
                   <ul className="space-y-2 mb-2">
                    {rfp.items?.map((item, i) => (
                      <li key={i} className="text-sm flex justify-between bg-slate-700/50 p-2.5 rounded-lg border border-slate-600">
                        <span className="font-semibold text-slate-100">{item.name}</span>
                        <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 rounded">Qty: {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {sendModalId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center"><Send className="mr-2 text-blue-600" /> Select Vendors</h2>
              <button onClick={() => setSendModalId(null)}><X size={24} /></button>
            </div>
            <div className="max-h-60 overflow-y-auto mb-6">
              {vendors.map(v => (
                <label key={v._id} className="flex items-center p-3 hover:bg-gray-50 border-b cursor-pointer">
                  <input type="checkbox" className="mr-3" checked={selectedEmails.includes(v.email)} onChange={() => toggleEmailSelection(v.email)} />
                  <div><p className="font-semibold">{v.name}</p><p className="text-xs text-gray-500">{v.email}</p></div>
                </label>
              ))}
            </div>
            <button onClick={handleSendRFP} disabled={sending} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">
              {sending ? "Sending..." : "Confirm & Send"}
            </button>
          </div>
        </div>
      )}

      {simulateModalId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <MessageSquare className="mr-2 text-purple-600" size={20} /> Simulate Vendor Reply
              </h2>
              <button onClick={() => setSimulateModalId(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="space-y-4 mb-6">
              <input type="email" placeholder="vendor@example.com" className="w-full p-2 border border-gray-300 rounded-lg" value={simulateForm.vendorEmail} onChange={e => setSimulateForm({...simulateForm, vendorEmail: e.target.value})} />
              <textarea rows="6" placeholder="Hey there, we can provide the items..." className="w-full p-3 border border-gray-300 rounded-lg" value={simulateForm.emailBody} onChange={e => setSimulateForm({...simulateForm, emailBody: e.target.value})}></textarea>
            </div>
            <button onClick={handleSimulateReply} disabled={parsing} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl flex justify-center items-center">
              {parsing ? <><Loader2 className="animate-spin mr-2" size={18} /> AI Parsing...</> : "Run AI Extraction"}
            </button>
          </div>
        </div>
      )}

      {evalModalId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Scale className="mr-2 text-orange-600" size={28} /> AI Proposal Evaluation</h2>
              <button onClick={() => setEvalModalId(null)} className="text-gray-400 hover:text-gray-600"><X size={28} /></button>
            </div>
            {evaluating ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
                <p className="text-gray-600 font-medium text-lg">AI is analyzing and comparing vendor proposals...</p>
              </div>
            ) : evalData && evalData.evaluation ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center mb-2"><Award className="text-orange-500 mr-2" size={24} /><h3 className="text-lg font-bold text-orange-900">Recommended Vendor</h3></div>
                  <p className="text-xl font-bold text-gray-800 mb-2">{evalData.evaluation.recommendedVendor}</p>
                  <p className="text-gray-700 italic">"{evalData.evaluation.reasoning}"</p>
                </div>
                <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Detailed Rankings</h3>
                <div className="grid gap-4">
                  {evalData.evaluation.rankings?.map((rank, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-4"><span className="font-bold text-lg text-gray-800">{rank.vendorEmail}</span><span className="bg-blue-100 text-blue-800 text-lg font-bold px-3 py-1 rounded-full">Score: {rank.score}/100</span></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start"><ThumbsUp className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} /><p className="text-sm text-gray-600">{rank.pros}</p></div>
                        <div className="flex items-start"><ThumbsDown className="text-red-500 mr-2 mt-1 flex-shrink-0" size={16} /><p className="text-sm text-gray-600">{rank.cons}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="text-center py-10 text-gray-500">Something went wrong fetching the evaluation data.</div>}
          </div>
        </div>
      )}

    </div>
  );
}