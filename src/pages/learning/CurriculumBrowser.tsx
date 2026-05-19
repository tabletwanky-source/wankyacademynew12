import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Clock, 
  Loader2, 
  Search,
  GraduationCap,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { curriculumService } from '../../services/curriculumService';
import { Curriculum } from '../../types';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CurriculumBrowser() {
  const { studentData } = useAuth();
  const navigate = useNavigate();
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!studentData) return;
    
    const unsubscribe = curriculumService.subscribePublishedCurriculums(
      studentData.department, 
      (data) => {
        setCurriculums(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentData]);

  const filtered = curriculums.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Academic Curriculums...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Search Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Academic Syllabus</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Professional Training Programs</p>
         </div>
         <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-2xl text-xs font-bold w-full outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
            />
         </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((curr) => (
          <motion.div 
            whileHover={{ y: -8 }}
            key={curr.id}
            onClick={() => navigate(`/dashboard/curriculum/${curr.id}`)}
            className="group cursor-pointer bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col h-full"
          >
            <div className="aspect-[16/10] relative overflow-hidden">
                <img 
                  src={curr.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"} 
                  alt={curr.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                   <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl text-white">
                      <PlayCircle className="w-5 h-5 fill-white/10" />
                   </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                   <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">{curr.difficulty}</p>
                   <h3 className="text-white font-black text-xl uppercase tracking-tighter leading-tight italic line-clamp-2">{curr.title}</h3>
                </div>
            </div>

            <div className="p-8 space-y-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{curr.duration || 'N/A'}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{curr.totalLessons} Lessons</span>
                 </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed italic flex-1">
                {curr.description}
              </p>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                       {curr.professorName?.charAt(0) || 'WA'}
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Professor</p>
                       <p className="text-[10px] font-bold text-slate-900">{curr.professorName || 'Academy Expert'}</p>
                    </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center space-y-6">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-200" />
             </div>
             <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">No published curriculum matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
