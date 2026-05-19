import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  User, 
  BookOpen, 
  Calendar,
  Search,
  Loader2,
  FileUp,
  X,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { certificateService } from '../../services/certificateService';
import { adminService } from '../../services/adminService';
import { Certificate, Student, CourseType } from '../../types';
import Modal from '../../components/common/Modal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminCertificateManager() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    studentUid: '',
    examTitle: '',
    score: 100,
    department: 'Informatique' as CourseType
  });

  const [importData, setImportData] = useState({
    certificateCode: '',
    studentName: '',
    pdfUrl: '',
    department: ''
  });

  useEffect(() => {
    const unsub = certificateService.subscribeAllCertificates(setCerts);
    adminService.getAllStudents().then(setStudents);
    setLoading(false);
    return unsub;
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.uid === formData.studentUid);
    if (!student) return;

    setSaving(true);
    try {
      await certificateService.generateCertificate({
        studentUid: student.uid,
        studentName: student.fullName,
        studentId: student.studentId,
        department: formData.department,
        examTitle: formData.examTitle,
        score: formData.score,
        issuedBy: 'Admin'
      });
      toast.success('Certificate generated successfully');
      setIsModalOpen(false);
      setFormData({ studentUid: '', examTitle: '', score: 100, department: 'Informatique' });
    } catch (err) {
      toast.error('Failed to generate certificate');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await certificateService.importOldCertificate({
        ...importData,
        issueDate: new Date() // Fallback to current date for imports if not specified
      });
      toast.success('Historical certificate imported');
      setIsImportModalOpen(false);
      setImportData({ certificateCode: '', studentName: '', pdfUrl: '', department: '' });
    } catch (err) {
      toast.error('Import failed');
    } finally {
      setSaving(false);
    }
  };

  const filteredCerts = certs.filter(c => 
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.certificateCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Certification Authority</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage official academic records & overrides</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsImportModalOpen(true)}
             className="px-6 py-4 bg-white text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-indigo-600 transition-all flex items-center gap-3"
           >
             <History className="w-5 h-5 text-indigo-600" />
             Import Old Record
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="px-8 py-4 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
           >
             <Plus className="w-5 h-5" />
             Issue New Certificate
           </button>
        </div>
      </div>

      {/* Stats row or Filter */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by student name or certificate code..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-xs font-bold italic outline-none focus:border-indigo-600 transition-all"
            />
         </div>
         <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span>TOTAL ISSUED: <span className="text-indigo-600">{certs.length}</span></span>
         </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Registry...</p>
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="bg-slate-50 p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
             <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching records found.</p>
          </div>
        ) : (
          filteredCerts.map((cert) => (
             <motion.div 
               key={cert.id}
               className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all"
             >
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100">
                      <Award className="w-8 h-8" />
                   </div>
                   <div>
                      <div className="flex items-center gap-3">
                         <h3 className="font-black text-slate-900 uppercase italic leading-none">{cert.studentName}</h3>
                         <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{cert.certificateCode}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{cert.examTitle} • {cert.department}</p>
                   </div>
                </div>

                <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Issue Date</p>
                      <p className="text-xs font-bold text-slate-700 italic">{cert.issueDate?.toDate?.()?.toLocaleDateString()}</p>
                   </div>
                   <div className="flex items-center gap-2">
                       <button 
                         onClick={() => certificateService.revokeCertificate(cert.id)}
                         className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                         title="Revoke Certificate"
                       >
                          <X className="w-5 h-5" />
                       </button>
                       <a 
                         href={`/verify-certificate/${cert.certificateCode}`}
                         target="_blank"
                         rel="noreferrer"
                         className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                       >
                          <ShieldCheck className="w-5 h-5" />
                       </a>
                   </div>
                </div>
             </motion.div>
          ))
        )}
      </div>

      {/* Manual Issue Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(null)} title="Manual Certificate Generation">
         <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Student</label>
               <select 
                 required
                 value={formData.studentUid}
                 onChange={e => setFormData(prev => ({ ...prev, studentUid: e.target.value }))}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all"
               >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.uid} value={s.uid}>{s.fullName} ({s.studentId})</option>
                  ))}
               </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
                  <select 
                    value={formData.department}
                    onChange={e => setFormData(prev => ({ ...prev, department: e.target.value as CourseType }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold"
                  >
                     <option value="Auto École">Auto École</option>
                     <option value="Informatique">Informatique</option>
                     <option value="Technique Informatique">Technique Informatique</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Score %</label>
                  <input 
                    type="number"
                    max={100}
                    min={0}
                    value={formData.score}
                    onChange={e => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Course/Exam Title</label>
               <input 
                 required
                 type="text"
                 value={formData.examTitle}
                 onChange={e => setFormData(prev => ({ ...prev, examTitle: e.target.value }))}
                 placeholder="e.g. Master Course in Web Development"
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold"
               />
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3">
               <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
               <p className="text-[9px] font-bold text-indigo-900 leading-relaxed uppercase italic">
                 Manual override: This certificate will be issued instantly and linked to the student record as an administrative issuance.
               </p>
            </div>

            <button 
              disabled={saving}
              className="w-full py-5 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic hover:bg-slate-800 transition-all shadow-xl"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              CONFIRM SYSTEM ISSUANCE
            </button>
         </form>
      </Modal>

      {/* Import Historical Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(null)} title="Historical Record Import">
         <form onSubmit={handleImport} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Code Historique</label>
               <input 
                 required
                 type="text"
                 value={importData.certificateCode}
                 onChange={e => setImportData(prev => ({ ...prev, certificateCode: e.target.value }))}
                 placeholder="WA-OLD-2023-XXXX"
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold"
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de l'Étudiant</label>
               <input 
                 required
                 type="text"
                 value={importData.studentName}
                 onChange={e => setImportData(prev => ({ ...prev, studentName: e.target.value }))}
                 placeholder="Full Name as on certificate"
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold"
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lien Document (PDF URL)</label>
               <input 
                 required
                 type="url"
                 value={importData.pdfUrl}
                 onChange={e => setImportData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                 placeholder="https://firebasestorage.../certificate.pdf"
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold"
               />
            </div>

            <div className="flex items-center gap-3 bg-amber-50 p-6 rounded-2xl border border-amber-100">
               <AlertCircle className="w-8 h-8 text-amber-600" />
               <p className="text-[9px] font-bold text-amber-800 uppercase leading-relaxed italic">
                 Importing records allows the public verification terminal to search and confirm older certificates.
               </p>
            </div>

            <button 
              disabled={saving}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic shadow-xl"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              SAVE HISTORICAL RECORD
            </button>
         </form>
      </Modal>
    </div>
  );
}
