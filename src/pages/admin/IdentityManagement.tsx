import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Loader2, Search, Fingerprint, ShieldCheck, Mail, User } from 'lucide-react';

export default function IdentityManagement() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const data = await adminService.getAllStudentCodes();
      setCodes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = codes.filter(c => 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Identity Management</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage Student Access Codes & System Identifiers</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search code or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm w-full md:w-80 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading System Identifiers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCodes.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.used ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {item.used ? 'Activated' : 'Provisioned'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">System Identity Code</p>
                  <h4 className="text-lg font-black text-slate-900 font-mono tracking-tighter bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{item.code}</h4>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-medium truncate">{item.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-tight truncate">UID: {item.uid || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-indigo-600/10"></div>
            </div>
          ))}

          {filteredCodes.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No registered student codes found in system.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
