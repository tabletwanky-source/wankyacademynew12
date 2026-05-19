import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, User } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Student } from '../../types';
import { useTranslation } from 'react-i18next';

export default function StudentsManagement() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    adminService.getAllStudents().then(res => {
      setStudents(res);
      setLoading(false);
    });
  }, []);

  const filtered = students.filter(s => 
    s.fullName.toLowerCase().includes(filter.toLowerCase()) || 
    s.studentCode.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-20 bg-white rounded-2xl border border-slate-200"></div>
        <div className="h-64 bg-white rounded-2xl border border-slate-200"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
       <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <div>
            <h2 className="font-black uppercase tracking-tight text-lg">Student Registry</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Enrollment System</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ID or Name..." 
                  className="bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs w-48 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  id="student-search-input"
                />
             </div>
             <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50" id="student-filter-btn">
               <Filter className="w-4 h-4 text-slate-500" />
             </button>
          </div>
       </div>

       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Profile</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Code</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Course</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => (
                <tr key={s.uid} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {s.photoURL ? (
                              <img src={s.photoURL} alt="p" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div>
                        <p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{s.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-black bg-slate-100 p-1 rounded tracking-tight text-slate-600">{s.studentCode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">{s.course}</span>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-medium text-slate-500">{s.phone}</td>
                  <td className="px-6 py-4 text-[11px] font-medium text-slate-500">
                    {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:text-indigo-600" id={`student-actions-${s.uid}`}><MoreVertical className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>
    </div>
  );
}
