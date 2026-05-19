import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Save,
  Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/adminService';
import { attendanceService } from '../../services/attendanceService';
import { Student, Attendance, CourseType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COURSES: CourseType[] = ['Auto École', 'Informatique', 'Technique Informatique'];

export default function AttendanceManager() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseType>(COURSES[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedRecords, setMarkedRecords] = useState<Record<string, 'present' | 'absent' | 'late' | null>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const [allStudents, dailyAtt] = await Promise.all([
          adminService.getAllStudents(),
          attendanceService.getDailyAttendance(selectedCourse, selectedDate)
        ]);
        
        const courseStudents = allStudents.filter(s => s.department === selectedCourse);
        setStudents(courseStudents);

        // Pre-fill marked records from existing data
        const initialMarks: Record<string, 'present' | 'absent' | 'late' | null> = {};
        courseStudents.forEach(s => {
          const record = dailyAtt.find(r => r.studentUid === s.uid);
          initialMarks[s.uid] = record ? (record.status as any) : null;
        });
        setMarkedRecords(initialMarks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse, selectedDate]);

  const toggleStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setMarkedRecords(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const promises = Object.entries(markedRecords).map(async ([studentId, status]) => {
        if (!status) return;
        const student = students.find(s => s.uid === studentId);
        if (!student) return;

        // Check if already exists to decide whether to update or create
        // Simplification for now: always overwrite/re-mark
        return attendanceService.markAttendance({
          studentUid: studentId,
          studentId: student.studentId,
          department: selectedCourse,
          date: selectedDate,
          status: status as 'present' | 'absent' | 'late',
          professorUid: 'admin'
        });
      });

      await Promise.all(promises);
      setMessage('Attendance records updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Control Bar */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 w-full md:w-auto">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Attendance <span className="text-indigo-600">Management</span></h1>
          <div className="flex gap-2">
            {COURSES.map(c => (
              <button 
                key={c}
                onClick={() => setSelectedCourse(c)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedCourse === c ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
           <div className="flex flex-col items-end gap-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Operational Date</p>
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
           </div>
           <button 
             onClick={handleSave}
             disabled={saving}
             className="h-full px-8 bg-[#0f172a] text-white rounded-2xl flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
           >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{saving ? 'Syncing...' : 'Commit Changes'}</span>
           </button>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border shadow-sm italic",
          message.includes('Failure') ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
        )}>
          {message.includes('Failure') ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {message}
        </div>
      )}

      {/* Student List Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading Student List...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead className="bg-slate-900 text-white">
                 <tr>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-indigo-300">Student Name</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-indigo-300">Student ID</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-indigo-300 text-center">Attendance Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {students.map(s => (
                   <tr key={s.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                               {s.photoURL ? (
                                 <img src={s.photoURL} alt="p" className="w-full h-full object-cover" />
                               ) : (
                                 <Users className="w-6 h-6 text-slate-300" />
                               )}
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{s.fullName}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{s.department}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 uppercase">
                        <span className="font-mono text-xs font-black tracking-tighter text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {s.studentId}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                           <button 
                             onClick={() => toggleStatus(s.uid, 'present')}
                             className={cn(
                               "px-4 py-2.5 rounded-xl border-2 flex items-center gap-2 transition-all group",
                               markedRecords[s.uid] === 'present' 
                                 ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-md shadow-emerald-100" 
                                 : "bg-white border-slate-100 text-slate-300 hover:border-emerald-200 hover:text-emerald-400"
                             )}
                           >
                             <CheckCircle2 className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">{t('attendance.present')}</span>
                           </button>

                           <button 
                             onClick={() => toggleStatus(s.uid, 'late')}
                             className={cn(
                               "px-4 py-2.5 rounded-xl border-2 flex items-center gap-2 transition-all",
                               markedRecords[s.uid] === 'late' 
                                 ? "bg-amber-50 border-amber-500 text-amber-600 shadow-md shadow-amber-100" 
                                 : "bg-white border-slate-100 text-slate-300 hover:border-amber-200 hover:text-amber-400"
                             )}
                           >
                             <Clock className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">{t('attendance.late')}</span>
                           </button>

                           <button 
                             onClick={() => toggleStatus(s.uid, 'absent')}
                             className={cn(
                               "px-4 py-2.5 rounded-xl border-2 flex items-center gap-2 transition-all",
                               markedRecords[s.uid] === 'absent' 
                                 ? "bg-red-50 border-red-500 text-red-600 shadow-md shadow-red-100" 
                                 : "bg-white border-slate-100 text-slate-300 hover:border-red-200 hover:text-red-400"
                             )}
                           >
                             <XCircle className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">{t('attendance.absent')}</span>
                           </button>
                        </div>

                      </td>
                   </tr>
                 ))}
                 {students.length === 0 && (
                   <tr>
                     <td colSpan={3} className="py-20 text-center text-slate-300 italic font-medium uppercase tracking-widest text-[10px]">
                       No Students Found For This Course.
                     </td>
                   </tr>
                 )}
               </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
