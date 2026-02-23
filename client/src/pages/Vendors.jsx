import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Mail, User, Loader2, Briefcase } from 'lucide-react';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactPerson: '',
    services: ''
  });
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get('/api/vendors');
      setVendors(res.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const vendorPayload = {
        ...formData,
        services: formData.services.split(',').map(s => s.trim()).filter(s => s)
      };

      await axios.post('/api/vendors', vendorPayload);
      setFormData({ name: '', email: '', contactPerson: '', services: '' });
      fetchVendors();
    } catch (error) {
      console.error("Error saving vendor:", error);
      alert("Failed to save vendor. Make sure the email is unique!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center mb-8">
        <Users className="text-blue-600 mr-3" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">Vendor Management</h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Plus className="mr-2 text-green-600" size={20} /> Add New Vendor
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Company Name *</label>
              <input 
                required 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address *</label>
              <input 
                required 
                type="email" 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Contact Person</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.contactPerson}
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Services (comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. IT, Furniture, Consulting"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.services}
                onChange={e => setFormData({...formData, services: e.target.value})}
              />
            </div>
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Save Vendor
            </button>
          </form>
        </div>
        <div className="lg:col-span-2">     
          {loading ? (        //vendor list
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : vendors.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border-2 border-dashed border-gray-300 text-center text-gray-500">
              No vendors added yet. Use the form to add your first vendor!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendors.map(vendor => (
                <div key={vendor._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{vendor.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center"><Mail size={16} className="mr-2 text-gray-400" /> {vendor.email}</p>
                    {vendor.contactPerson && (
                      <p className="flex items-center"><User size={16} className="mr-2 text-gray-400" /> {vendor.contactPerson}</p>
                    )}
                    {vendor.services && vendor.services.length > 0 && (
                      <p className="flex items-center"><Briefcase size={16} className="mr-2 text-gray-400" /> {vendor.services.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}