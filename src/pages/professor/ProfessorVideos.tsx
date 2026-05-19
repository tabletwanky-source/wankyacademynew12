import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Plus, 
  Trash2, 
  Play, 
  Loader2, 
  Search, 
  ExternalLink, 
  Film,
  PlusCircle,
  X,
  Save,
  Youtube
} from 'lucide-react';
import { learningService } from '../../services/learningService';
import { Video as VideoType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';
import { motion, AnimatePresence } from 'motion/react';

export default function ProfessorVideos() {
  const { userData } = useAuth();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    duration: ''
  });

  useEffect(() => {
    if (userData?.department) {
      loadVideos();
    }
  }, [userData]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await learningService.getVideosByDepartment(userData!.department);
      setVideos(data);
    } catch (err) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.department) return;
    setSubmitting(true);
    try {
      await learningService.addVideo({
        ...formData,
        videoUrl: formData.url, // Map url to videoUrl
        videoType: 'youtube', // Default for now or detect from URL
        department: userData.department,
        createdBy: userData.uid,
        published: true
      } as any);
      toast.success('Cours vidéo ajouté avec succès !');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', url: '', thumbnail: '', duration: '' });
      loadVideos();
    } catch (err) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette vidéo ?')) return;
    try {
      await learningService.deleteVideo(id);
      setVideos(videos.filter(v => v.id !== id));
      toast.success('Vidéo supprimée');
    } catch (err) {
      toast.error('Erreur de suppression');
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vidéothèque Académique</h1>
          <p className="text-slate-500 mt-1">Gérez les leçons vidéo pour les étudiants de {userData?.department}.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Ajouter une Vidéo</span>
        </button>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-slate-50 pb-6">
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher une leçon..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg italic">
            Total: {videos.length} Vidéos
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Chargement de la bibliothèque...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredVideos.map((video) => (
                <motion.div 
                  layout
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col h-full"
                >
                  <div className="aspect-video bg-slate-100 relative group-hover:bg-slate-200 transition-colors">
                    {video.thumbnail && video.thumbnail !== "" ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Film className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                       <Play className="w-12 h-12 fill-current" />
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/80 text-white text-[10px] font-bold rounded backdrop-blur-sm">
                       {video.duration || '00:00'}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 mb-2 truncate italic group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{video.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {video.description || "Aucune description fournie pour cette leçon vidéo."}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                       <a 
                        href={video.videoUrl || video.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest text-[#0f172a] hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                       >
                         Visualiser <ExternalLink className="w-3 h-3" />
                       </a>
                       <button 
                        onClick={() => handleDelete(video.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                       >
                        <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredVideos.length === 0 && (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-4">
                <Video className="w-12 h-12 text-slate-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Aucun contenu vidéo disponible</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter une Leçon Vidéo"
      >
        <form onSubmit={handleCreate} className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
           <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Titre de la leçon</span>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-300"
                  placeholder="Ex: Introduction au JavaScript"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">URL de la vidéo (YouTube/Vimeo)</span>
                <div className="relative">
                  <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input 
                    required
                    type="url" 
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono italic"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Durée</span>
                  <input 
                    type="text" 
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="15:30"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Thumbnail (Facultatif)</span>
                  <input 
                    type="url" 
                    value={formData.thumbnail}
                    onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="URL de l'image"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Description</span>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  placeholder="Résumé de la leçon..."
                ></textarea>
              </label>
           </div>

           <button
             type="submit"
             disabled={submitting}
             className="w-full py-5 bg-[#0f172a] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
           >
             {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
             PUBLIER LA LEÇON
           </button>
        </form>
      </Modal>
    </div>
  );
}
