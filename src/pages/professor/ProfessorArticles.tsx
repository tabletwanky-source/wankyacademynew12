import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Loader2, 
  Search, 
  PlusCircle,
  Save,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { blogService } from '../../services/blogService';
import { Article } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';
import { motion, AnimatePresence } from 'motion/react';

export default function ProfessorArticles() {
  const { userData } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    thumbnail: '',
    category: 'Educational',
    status: 'published' as 'draft' | 'published' | 'archived'
  });

  useEffect(() => {
    const unsub = blogService.subscribeArticles((data) => {
      // Filter by author if professor, show all if admin
      if (userData?.role === 'admin' || userData?.role === 'super_admin') {
        setArticles(data);
      } else {
        setArticles(data.filter(a => a.authorId === userData?.uid));
      }
      setLoading(false);
    }, false); // shows both published and unpublished for management
    return () => unsub();
  }, [userData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setSubmitting(true);
    try {
      await blogService.addArticle({
        ...formData,
        authorId: userData.uid,
        authorName: userData.fullName,
        authorRole: userData.role === 'admin' ? 'admin' : 'professor',
        published: formData.status === 'published'
      });
      toast.success('Article créé avec succès !');
      setIsModalOpen(false);
      setFormData({ 
        title: '', 
        description: '', 
        content: '', 
        thumbnail: '', 
        category: 'Educational',
        status: 'published'
      });
    } catch (err) {
      toast.error('Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article définitivement ?')) return;
    try {
      await blogService.deleteArticle(id);
      toast.success('Article supprimé');
    } catch (err) {
      toast.error('Erreur de suppression');
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight italic uppercase">Gestion des Articles</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest flex items-center gap-2">
            <FileText className="w-3 h-3" /> Blog & Publications Académiques
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto px-8 py-4 bg-[#0f172a] text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <PlusCircle className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">Rédiger un Article</span>
        </button>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center border-b border-slate-50 pb-8">
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher par titre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 pl-11 pr-4 py-4 rounded-2xl text-sm w-full outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>)}
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               {articles.length} Publications
             </span>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6">
             <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                </div>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Synchronisation du Blog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredArticles.map((article, i) => (
                <motion.div 
                  layout
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col h-full relative"
                >
                   {/* Status Badge */}
                   <div className="absolute top-4 left-4 z-20">
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest italic border backdrop-blur-md ${
                        article.status === 'published' ? 'bg-emerald-500/90 text-white border-emerald-400' : 
                        article.status === 'draft' ? 'bg-amber-500/90 text-white border-amber-400' :
                        'bg-slate-500/90 text-white border-slate-400'
                      }`}>
                        {article.status}
                      </span>
                   </div>

                   <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                     {article.thumbnail ? (
                       <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-200">
                         <ImageIcon className="w-16 h-16" />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6">
                        <div className="text-white">
                           <p className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-1">{article.category || 'ACADÉMIQUE'}</p>
                           <h3 className="font-black text-lg italic leading-tight line-clamp-2 uppercase tracking-tight">{article.title}</h3>
                        </div>
                     </div>
                   </div>

                   <div className="p-8 flex-1 flex flex-col justify-between">
                     <p className="text-xs text-slate-500 line-clamp-3 mb-8 leading-relaxed italic">
                       {article.description}
                     </p>
                     
                     <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1.5 text-slate-400">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{article.likesCount || 0}</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-400">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{article.commentsCount || 0}</span>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           <button 
                            onClick={() => handleDelete(article.id)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Supprimer"
                           >
                            <Trash2 className="w-4 h-4" />
                           </button>
                           <button className="p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all">
                              <Eye className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredArticles.length === 0 && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-100">
                  <FileText className="w-12 h-12" />
                </div>
                <div className="space-y-1">
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 italic">📰 Votre plume n'attend que vous</p>
                   <p className="text-[9px] font-bold text-slate-200 uppercase">Commencez à rédiger votre premier article académique</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rédiger un Article"
      >
        <form onSubmit={handleCreate} className="space-y-8 p-2 max-h-[80vh] overflow-y-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <label className="block space-y-2">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Titre de l'Article</span>
                   <input 
                     required
                     type="text" 
                     value={formData.title}
                     onChange={e => setFormData({...formData, title: e.target.value})}
                     className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-md font-black italic focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                     placeholder="Un titre accrocheur..."
                   />
                 </label>

                 <label className="block space-y-2">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Résumé / Description</span>
                   <textarea 
                     required
                     rows={3}
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                     className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm italic focus:ring-4 focus:ring-indigo-500/10 outline-none"
                     placeholder="Expliquez brièvement de quoi parle votre article..."
                   ></textarea>
                 </label>

                 <label className="block space-y-2">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Image de Couverture (URL)</span>
                   <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="url" 
                        value={formData.thumbnail}
                        onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                        className="w-full p-5 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono"
                        placeholder="https://images.unsplash.com/..."
                      />
                   </div>
                 </label>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <label className="block space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Catégorie</span>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
                      >
                         <option value="Educational">Éducation</option>
                         <option value="Tech">Technologie</option>
                         <option value="Event">Événement</option>
                         <option value="Guide">Guide Pratique</option>
                      </select>
                    </label>
                    <label className="block space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Statut</span>
                      <select 
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
                      >
                         <option value="published">Publier</option>
                         <option value="draft">Brouillon</option>
                      </select>
                    </label>
                 </div>

                 <label className="block space-y-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Contenu de l'Article</span>
                    <textarea 
                      required
                      rows={8}
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm leading-relaxed focus:ring-4 focus:ring-indigo-500/10 outline-none"
                      placeholder="Utilisez du HTML simple pour le formatage..."
                    ></textarea>
                 </label>
              </div>
           </div>

           <button
             type="submit"
             disabled={submitting}
             className="w-full py-6 bg-[#0f172a] text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-4 active:scale-[0.98] mt-4"
           >
             {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6 text-indigo-400" />}
             ENREGISTRER LA PUBLICATION
           </button>
        </form>
      </Modal>
    </div>
  );
}
