import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Settings, 
  Trash2, 
  Eye, 
  BarChart2, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronRight,
  Loader2,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { Exam, CourseType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/language/LanguageSwitcher';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COURSES: CourseType[] = ['Auto École', 'Informatique', 'Technique Informatique'];

export default function ExamManager() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await examService.getAllExams();
      setExams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await examService.deleteExam(id);
      setExams(exams.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const togglePublish = async (exam: Exam) => {
    try {
      const newPublished = !exam.published;
      await examService.updateExam(exam.id, { 
        published: newPublished,
        status: newPublished ? 'active' : 'draft',
        active: true
      });
      setExams(exams.map(e => e.id === exam.id ? { 
        ...e, 
        published: newPublished,
        status: newPublished ? 'active' : 'draft',
        active: true
      } : e));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredExams = exams.filter(e => {
    const matchesCourse = selectedCourse === 'All' || e.courseId === selectedCourse;
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Exam Management</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry of active exams</p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link 
            to="/admin-dashboard/exams/create"
            className="px-8 py-4 bg-[#0f172a] text-white rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-slate-200"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('exams.start')}</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex bg-slate-50 p-1 rounded-xl w-fit">
            {['All', ...COURSES].map(c => (
              <button
                key={c}
                onClick={() => setSelectedCourse(c as any)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedCourse === c ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-xl text-xs font-bold w-full md:w-64 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading Exams...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredExams.map((exam) => (
              <motion.div 
                layout
                key={exam.id}
                className="group relative bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-indigo-600 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{exam.title}</h3>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                          exam.published ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {exam.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Plus className="w-3 h-3 rotate-45" /> {exam.courseId}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {exam.duration}m
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3" /> Pass: {exam.passingScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => togglePublish(exam)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        exam.published ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-50"
                      )}
                      title={exam.published ? 'Unpublish' : 'Publish'}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <Link 
                      to={`/admin-dashboard/exams/${exam.id}/questions`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Manage Questions"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(exam.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-100 mx-2"></div>
                    <Link 
                      to={`/admin-dashboard/exams/${exam.id}/analytics`}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Stats</span>
                    </Link>
                  </div>
                </div>

                {/* Question Count Badge */}
                <div className="absolute top-0 right-0 p-1">
                   <div className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-bl-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     {exam.totalQuestions || 0} Questions
                   </div>
                </div>
              </motion.div>
            ))}

            {filteredExams.length === 0 && (
              <div className="py-20 text-center text-slate-300 italic font-medium uppercase tracking-widest text-[10px] border-2 border-dashed border-slate-50 rounded-3xl">
                No exams found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
