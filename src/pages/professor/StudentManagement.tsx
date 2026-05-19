import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, ListFilter as Filter, Mail, Phone, ChevronRight, ExternalLink, MessageCircle, FileText, Calendar, CircleCheck as CheckCircle2, Clock, User, GraduationCap, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Student, CourseType, AttendanceStatus } from '../../types';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function ProfessorStudentManagement() {
  const { userData } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Stats
  const [studentStats, setStudentStats] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!userData?.department) return;

    const unsub = userService.subscribeDepartmentStudents(userData.department as CourseType, (data) => {
      setStudents(data);
      setLoading(false);
    });

    return () => unsub();
  }, [userData]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleContactWhatsApp = (phoneNumber: string) => {
    const fresh = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${fresh}`, '_blank');
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-white rounded-[2.5rem] border border-slate-200"></div>
      <div className="h-96 bg-white rounded-[2.5rem] border border-slate-200"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 italic">Votre Classe</p>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Gestion des Étudiants</h2>
           <p className="text-slate-400 mt-1 font-medium text-xs">Département: <span className="text-indigo-600 font-bold underline decoration-indigo-200 underline-offset-4">{userData?.department}</span></p>
        </div>
        <div className="flex gap-3 relative z-10">
           <div className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center min-w-[120px]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-2xl font-black text-slate-900 italic tracking-tight">{students.length}</p>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou code..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Students List */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px]">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic">Annuaire Étudiant</h3>
             <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">{filteredStudents.length} Résultats</span>
          </div>

          <div className="divide-y divide-slate-50">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <div 
                  key={student.uid}
                  onClick={() => setSelectedStudent(student)}
                  className={cn(
                    "p-6 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 relative group",
                    selectedStudent?.uid === student.uid && "bg-indigo-50/50"
                  )}
                >
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                         {student.profileImageUrl || student.photoURL ? (
                           <img src={student.profileImageUrl || student.photoURL} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <User className="w-8 h-8 text-slate-200" />
                         )}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 italic tracking-tight group-hover:text-indigo-600 transition-colors">{student.fullName}</p>
                         <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{student.studentId || 'Pas de code'}</p>
                         <div className="flex gap-3 mt-1.5 opacity-60">
                            <span className="text-[10px] font-bold flex items-center gap-1 text-slate-500"><Mail className="w-2.5 h-2.5" /> {student.email}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        student.status === 'active' ? "bg-emerald-500" : "bg-slate-300"
                      )}></div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                   </div>
                   {selectedStudent?.uid === student.uid && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                </div>
              ))
            ) : (
              <div className="py-24 text-center space-y-4">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Search className="w-10 h-10 text-slate-200" />
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun étudiant trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div 
                key={selectedStudent.uid}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-[2.5rem] border border-indigo-100 shadow-2xl p-8 sticky top-8 space-y-8"
              >
                  <div className="text-center space-y-4">
                      <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center mx-auto overflow-hidden border-4 border-white shadow-xl">
                         {selectedStudent.profileImageUrl || selectedStudent.photoURL ? (
                           <img src={selectedStudent.profileImageUrl || selectedStudent.photoURL} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <User className="w-12 h-12 text-slate-200" />
                         )}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">{selectedStudent.fullName}</h4>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{selectedStudent.studentId}</p>
                      </div>
                      <Link 
                        to={`/professor/dashboard/students/${selectedStudent.uid}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                      >
                         <Eye className="w-3 h-3" /> Voir Profil Complet
                      </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleContactWhatsApp(selectedStudent.phoneNumber || selectedStudent.phone || '')}
                        className="py-4 bg-emerald-600 text-white rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 group"
                      >
                         <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                      </button>
                      <a 
                        href={`mailto:${selectedStudent.email}`}
                        className="py-4 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 group"
                      >
                         <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                      </a>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Infos Personnelles</h5>
                        <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Téléphone</span>
                              <span className="text-xs font-black text-slate-900">{selectedStudent.phoneNumber || selectedStudent.phone || 'N/A'}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Né(e) le</span>
                              <span className="text-xs font-black text-slate-900 italic">{selectedStudent.dateOfBirth || 'N/A'}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inscrit le</span>
                              <span className="text-xs font-black text-slate-900 italic">
                                {selectedStudent.createdAt?.seconds ? new Date(selectedStudent.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                              </span>
                           </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Action Académique</h5>
                        <div className="space-y-3">
                           <button className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-100 italic flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all">
                              <GraduationCap className="w-4 h-4" /> Voir Résultats Examens
                           </button>
                           <button className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-100 italic flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all">
                              <Calendar className="w-4 h-4" /> Rapport de Présence
                           </button>
                        </div>
                    </div>
                  </div>
              </motion.div>
            ) : (
              <div className="bg-slate-100 rounded-[2.5rem] border border-slate-200 border-dashed p-12 text-center h-[600px] flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm">
                     <User className="w-10 h-10" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[180px]">Sélectionnez un étudiant pour voir son profil complet</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
