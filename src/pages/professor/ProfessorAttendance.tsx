import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  Search, 
  Loader2, 
  ShieldCheck, 
  Save,
  UserCheck
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { Student, AttendanceStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProfessorAttendance() {
  const { userData } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData?.department) {
      loadStudents();
    }
  }, [userData]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getStudentsByDepartment(userData!.department);
      setStudents(data);
      
      // Initialize everyone as present by default
      const initial: Record<string, AttendanceStatus> = {};
      data.forEach(s => {
        initial[s.uid] = AttendanceStatus.PRESENT;
      });
      setAttendance(initial);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (uid: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [uid]: status }));
  };

  const handleSave = async () => {
    if (!userData?.department) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentUid: s.uid,
        studentId: s.studentId,
        professorUid: userData?.uid || '',
        date: date,
        status: attendance[s.uid] || AttendanceStatus.ABSENT,
        department: userData.department
      }));

      await attendanceService.markAttendance(records);
      toast.success('Feuille de présence enregistrée pour aujourd\'hui !');
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement de la liste d'appel...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appel Quotidien</h1>
          <p className="text-slate-500 mt-1">Marquez la présence des étudiants de votre département.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-white border border-slate-200 pl-11 pr-4 py-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative group w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Rechercher étudiant..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                        <UserCheck className="w-3 h-3" />
                        {Object.values(attendance).filter(v => v === AttendanceStatus.PRESENT).length} Présents
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-100">
                        <XCircle className="w-3 h-3" />
                        {Object.values(attendance).filter(v => v === AttendanceStatus.ABSENT).length} Absents
                     </div>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 italic">
                           <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Étudiant</th>
                           <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 font-mono">
                        {filteredStudents.map((student) => (
                           <tr key={student.uid} className="hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                       <img src={student.photoURL} alt={student.fullName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-xs font-black text-slate-900 italic uppercase">{student.fullName}</span>
                                       <span className="text-[9px] font-bold text-indigo-400 tracking-wider font-mono">{student.studentId}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center justify-center gap-2">
                                    {[
                                      { status: AttendanceStatus.PRESENT, label: 'PRÉSENT', color: 'emerald', icon: <CheckCircle /> },
                                      { status: AttendanceStatus.ABSENT, label: 'ABSENT', color: 'red', icon: <XCircle /> },
                                      { status: AttendanceStatus.LATE, label: 'RETARD', color: 'amber', icon: <Clock /> }
                                    ].map((opt) => (
                                      <button
                                        key={opt.status}
                                        onClick={() => setStatus(student.uid, opt.status)}
                                        className={cn(
                                          "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2",
                                          attendance[student.uid] === opt.status 
                                            ? `bg-${opt.color}-50 border-${opt.color}-500 text-${opt.color}-700 shadow-sm` 
                                            : "bg-white border-transparent text-slate-300 hover:border-slate-200"
                                        )}
                                      >
                                        {React.cloneElement(opt.icon as React.ReactElement<any>, { className: "w-3.5 h-3.5 shadow-sm" })}
                                        {opt.label}
                                      </button>
                                    ))}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8 h-fit sticky top-8">
               <div className="text-center pt-4">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100 shadow-inner">
                     <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 italic">Validation Quotidienne</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                     Assurez-vous que l'appel est complet avant de valider. Les données seront accessibles par l'administration et les étudiants.
                  </p>
               </div>

               <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-2">
                     <span className="text-slate-400">Date de session</span>
                     <span className="text-slate-900">{date}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-2">
                     <span className="text-slate-400">Total Étudiants</span>
                     <span className="text-slate-900">{students.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-2">
                     <span className="text-slate-400">Taux estimé</span>
                     <span className="text-indigo-600">
                        {students.length > 0 ? Math.round((Object.values(attendance).filter(v => v === AttendanceStatus.PRESENT).length / students.length) * 100) : 0}%
                     </span>
                  </div>
               </div>

               <button 
                  onClick={handleSave}
                  disabled={saving || students.length === 0}
                  className="w-full py-5 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 group active:scale-[0.98]"
               >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 transition-transform group-hover:scale-110" />}
                  <span className="text-xs font-black uppercase tracking-[0.3em]">Valider l'Appel</span>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
