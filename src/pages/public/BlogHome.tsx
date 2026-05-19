import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  User, 
  ThumbsUp, 
  MessageSquare, 
  ChevronRight, 
  Calendar,
  ArrowRight,
  Loader2,
  FileText,
  Tag
} from 'lucide-react';
import { blogService } from '../../services/blogService';
import { Article } from '../../types';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function BlogHome() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const unsub = blogService.subscribeArticles((data) => {
      setArticles(data);
      setLoading(false);
    }, true);
    return () => unsub();
  }, []);

  const categories = ['All', 'Educational', 'Tech', 'Event', 'Guide'];

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = filteredArticles[0];
  const otherArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Blog Header */}
      <div className="bg-[#0f172a] text-white py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-4"
           >
              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-6">
                 Actualités <br/> <span className="text-indigo-500">Académiques</span>
              </h1>
              <p className="max-w-2xl mx-auto text-slate-400 text-lg uppercase font-black tracking-widest italic opacity-80">
                 Explorez les articles, les guides et les leçons rédigés par nos experts.
              </p>
           </motion.div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 pb-24 relative z-20 space-y-20">
         {/* Search & Filter Bar */}
         <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
               {categories.map(cat => (
                 <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic border ${
                    selectedCategory === cat 
                      ? 'bg-[#0f172a] text-white shadow-xl shadow-slate-200 border-slate-900' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border-slate-100'
                  }`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
            
            <div className="relative group w-full md:w-96">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               <input 
                type="text" 
                placeholder="Rechercher un sujet..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-50 border-none pl-14 pr-6 py-4.5 rounded-[1.5rem] text-sm w-full outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder:text-slate-300"
               />
            </div>
         </div>

         {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-8">
               <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-indigo-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
               </div>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 px-6 text-center animate-pulse italic">Préparation de la lecture académique...</p>
            </div>
         ) : filteredArticles.length > 0 ? (
           <div className="space-y-20">
             {/* Featured Article */}
             {featuredArticle && !searchTerm && selectedCategory === 'All' && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="relative group bg-white rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-0"
               >
                  <div className="aspect-[4/3] lg:aspect-auto relative overflow-hidden bg-slate-900">
                     <img 
                      src={featuredArticle.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop'} 
                      alt={featuredArticle.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90"
                     />
                     <div className="absolute top-8 left-8">
                        <span className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black italic rounded-xl uppercase tracking-widest shadow-xl">À LA UNE</span>
                     </div>
                  </div>
                  <div className="p-12 lg:p-20 flex flex-col justify-center space-y-10">
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full italic">{featuredArticle.category || 'ACADÉMIQUE'}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(featuredArticle.createdAt?.toDate?.() || featuredArticle.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 italic leading-[1.1] uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-lg text-slate-500 leading-relaxed italic opacity-80 line-clamp-3">
                          {featuredArticle.description}
                        </p>
                     </div>
                     <Link 
                      to={`/blog/${featuredArticle.id}`}
                      className="w-fit flex items-center gap-4 text-sm font-black uppercase tracking-widest text-[#0f172a] hover:text-indigo-600 transition-all border-b-2 border-indigo-500 pb-2 italic group/btn"
                     >
                       Lire l'article complet <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                     </Link>
                  </div>
               </motion.div>
             )}

             {/* Article Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {otherArticles.map((article, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={article.id}
                    className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative"
                  >
                     <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden">
                        <img 
                          src={article.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop'} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent p-6 flex flex-col justify-end">
                           <div className="flex items-center gap-2 mb-2">
                             <Tag className="w-3 h-3 text-indigo-400" />
                             <span className="text-[8px] font-black text-indigo-100 uppercase tracking-widest italic">{article.category || 'ACADÉMIQUE'}</span>
                           </div>
                           <h3 className="font-black text-xl italic text-white leading-tight uppercase tracking-tight line-clamp-2">{article.title}</h3>
                        </div>
                     </div>
                     <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
                        <p className="text-xs text-slate-500 italic opacity-80 leading-relaxed line-clamp-3">
                           {article.description}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-slate-50 pt-8 mt-auto">
                           <div className="flex items-center gap-4 text-slate-400">
                              <div className="flex items-center gap-1.5 underline decoration-slate-200">
                                 <ThumbsUp className="w-3.5 h-3.5" />
                                 <span className="text-[10px] font-bold">{article.likesCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1.5 underline decoration-slate-200">
                                 <MessageSquare className="w-3.5 h-3.5" />
                                 <span className="text-[10px] font-bold">{article.commentsCount || 0}</span>
                              </div>
                           </div>
                           <Link 
                            to={`/blog/${article.id}`}
                            className="p-4 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center"
                           >
                             <ChevronRight className="w-5 h-5" />
                           </Link>
                        </div>
                     </div>
                  </motion.div>
                ))}
             </div>
           </div>
         ) : (
           <div className="py-40 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-100">
                 <Search className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                 <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Désolé, aucun article ne correspond à votre recherche</p>
                 <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                  className="text-[10px] font-black text-indigo-500 uppercase tracking-widest underline underline-offset-4"
                 >
                   Réinitialiser les filtres
                 </button>
              </div>
           </div>
         )}
      </div>

      <footer className="bg-white border-t border-slate-100 py-16 text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic mb-4">© 2026 Wanky Academy Academic Blog</p>
         <p className="text-[8px] font-bold text-slate-200 uppercase tracking-widest">Éduquer • Inspirer • Connecter</p>
      </footer>
    </div>
  );
}
