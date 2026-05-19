import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Settings, 
  Trash2, 
  Eye, 
  Layout, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  Users,
  Video,
  FileText,
  Edit,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { curriculumService } from '../../services/curriculumService';
import { userService } from '../../services/userService';
import { Curriculum, CourseType, Professor } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import CurriculumForm from './components/CurriculumForm';
import ModuleManager from './components/ModuleManager';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEPARTMENTS: CourseType[] = ['Auto École', 'Informatique', 'Technique Informatique'];

export default function CurriculumTerminal() {
  const { userData, role } = useAuth();
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<CourseType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [managingModules, setManagingModules] = useState<Curriculum | null>(null);
  const [professors, setProfessors] = useState<Professor[]>([]);

  const isAdmin = role === 'admin' || (role as string) === 'super_admin';

  useEffect(() => {
    let unsubscribe: () => void;
    
    if (isAdmin) {
      unsubscribe = curriculumService.subscribeAllCurriculums(setCurriculums);
    } else {
      unsubscribe = curriculumService.subscribeProfessorCurriculums(userData?.uid || '', setCurriculums);
    }

    setLoading(false);

    // Fetch professors for the form
    userService.getUsersByRole('professor').then(data => {
      setProfessors(data as Professor[]);
    });

    return () => unsubscribe && unsubscribe();
  }, [role, userData?.uid]);

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce curriculum ?')) return;
    try {
      await curriculumService.deleteCurriculum(id);
      toast.success('Curriculum supprimé');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression');
    }
  };

  const togglePublish = async (curr: Curriculum) => {
    try {
      await curriculumService.updateCurriculum(curr.id, { 
        published: !curr.published,
        status: !curr.published ? 'published' : 'draft'
      });
      toast.success(curr.published ? 'Curriculum dépublié' : 'Curriculum publié');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filtered = curriculums.filter(c => {
    const matchesDept = selectedDept === 'All' || c.department === selectedDept;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.professorName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Curriculum Terminal Loading...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Curriculum Terminal</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Handled by Professors & Administrators
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              setEditingCurriculum(null);
              setIsFormOpen(true);
            }}
            className="px-8 py-4 bg-[#0f172a] text-white rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-slate-200"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Create Curriculum</span>
          </button>
        )}
      </div>

      {/* Analytics Mini Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
            <h4 className="text-xl font-black text-slate-900">{curriculums.length}</h4>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Published</p>
            <h4 className="text-xl font-black text-emerald-600">{curriculums.filter(c => c.published).length}</h4>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Lessons</p>
            <h4 className="text-xl font-black text-indigo-600">{curriculums.reduce((acc, c) => acc + (c.totalLessons || 0), 0)}</h4>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Departments</p>
            <h4 className="text-xl font-black text-slate-900">{new Set(curriculums.map(c => c.department)).size}</h4>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex bg-slate-50 p-1 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
            {['All', ...DEPARTMENTS].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDept(d as any)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedDept === d ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="relative group min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title or professor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-xl text-xs font-bold w-full outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {filtered.map((curr) => (
            <motion.div 
              layout
              key={curr.id}
              className="group relative bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={curr.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"} 
                  alt={curr.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4 flex gap-2">
                   <span className={cn(
                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md border",
                      curr.published ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                   )}>
                      {curr.published ? 'Published' : 'Draft'}
                   </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1 block">{curr.department}</span>
                  <h3 className="text-white font-black text-lg uppercase tracking-tight line-clamp-1">{curr.title}</h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{curr.description}</p>
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                         <GraduationCap className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Professor</p>
                        <p className="text-[10px] font-bold text-slate-900">{curr.professorName || 'Unassigned'}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Content</p>
                      <p className="text-[10px] font-bold text-slate-900">{curr.totalLessons || 0} Lessons</p>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setManagingModules(curr)}
                     className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                   >
                     <Layout className="w-3.5 h-3.5" />
                     Manage Modules
                   </button>
                   <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setEditingCurriculum(curr);
                          setIsFormOpen(true);
                        }}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                        title="Edit Overview"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => togglePublish(curr)}
                        className={cn(
                          "p-3 rounded-xl transition-all",
                          curr.published ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-50"
                        )}
                        title={curr.published ? 'Unpublish' : 'Publish'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(curr.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-slate-200" />
             </div>
             <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic italic">
                📚 No curriculum available yet.
             </p>
             {isAdmin && (
               <button 
                 onClick={() => setIsFormOpen(true)}
                 className="text-indigo-600 font-bold underline text-xs"
               >
                 Create New Curriculum
               </button>
             )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <CurriculumForm 
            curriculum={editingCurriculum}
            professors={professors}
            onClose={() => setIsFormOpen(false)}
          />
        )}
        {managingModules && (
          <ModuleManager 
            curriculum={managingModules}
            onClose={() => setManagingModules(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
