import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  BarChart3,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { Attendance } from '../../types';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AttendanceHistory() {
  const { studentData } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentData) return;
    const unsubscribe = attendanceService.subscribeStudentAttendance(studentData.uid, (res) => {
      setAttendance(res);
      setLoading(false);
    });
    return unsubscribe;
  }, [studentData]);

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading Attendance Records...</p>
    </div>
  );

  const stats = attendance.reduce((acc, curr) => {
    const status = curr.status as 'present' | 'absent' | 'late';
    acc[status] = (acc[status] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { present: 0, absent: 0, late: 0, total: 0 });

  const presentPercent = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Attendance <span className="text-indigo-600">History</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Official Academy Attendance Records</p>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Attendance Rate</span>
           <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-indigo-600 tracking-tighter">{presentPercent}%</span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: `${presentPercent}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Records', value: stats.total, icon: BarChart3, color: 'text-slate-400' },
          { label: 'Present', value: stats.present, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Absent', value: stats.absent, icon: XCircle, color: 'text-red-500' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'text-amber-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="flex justify-between items-center mb-4 relative z-10">
                <item.icon className={cn("w-5 h-5", item.color)} />
                <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-200 transition-colors" />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">{item.label}</p>
             <h3 className="text-2xl font-black text-slate-900 mt-1 relative z-10">{item.value}</h3>
             <div className={cn("absolute -bottom-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-20", item.color.replace('text-', 'bg-'))}></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mt-8">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Detailed History</h2>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Student Name</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Student ID</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attendance.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                       <span className="text-xs font-black text-slate-900 italic tracking-tight">{studentData?.fullName}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900">{new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Time: Unspecified Session</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="font-mono text-[10px] font-black bg-slate-100 text-slate-500 p-1 px-2 rounded-lg">{studentData?.studentId}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={cn(
                         "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border italic",
                         log.status === 'present' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                         log.status === 'absent' ? "bg-red-50 text-red-600 border-red-100" :
                         "bg-amber-50 text-amber-600 border-amber-100"
                       )}>
                         {log.status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                         {log.status === 'absent' && <XCircle className="w-3 h-3" />}
                         {log.status === 'late' && <Clock className="w-3 h-3" />}
                         {log.status}
                       </span>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-8 py-20 text-center text-slate-300 italic font-medium">
                       No attendance records found.
                     </td>
                   </tr>
                )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
