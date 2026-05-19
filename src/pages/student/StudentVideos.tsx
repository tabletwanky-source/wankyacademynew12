import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Clock, 
  Film, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { learningService } from '../../services/learningService';
import { Video, VideoProgress, VideoComment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function StudentVideos() {
  const { studentData } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [progress, setProgress] = useState<VideoProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!studentData) return;

    const unsubVideos = learningService.subscribeVideosByDepartment(studentData.department, (data) => {
      setVideos(data.filter(v => v.published));
    });

    const unsubProgress = learningService.subscribeVideoProgress(studentData.uid, (data) => {
      setProgress(data);
    });

    setLoading(false);
    return () => {
      unsubVideos();
      unsubProgress();
    };
  }, [studentData]);

  useEffect(() => {
    if (selectedVideo) {
      const unsubComments = learningService.subscribeVideoComments(selectedVideo.id, setComments);
      return () => unsubComments();
    }
  }, [selectedVideo]);

  const handleVideoSelect = async (video: Video) => {
    setSelectedVideo(video);
    // Mark as started if not already
    const existing = progress.find(p => p.videoId === video.id);
    if (!existing && studentData) {
      await learningService.updateVideoProgress(studentData.uid, video.id, 0, false);
    }
  };

  const handleComplete = async () => {
    if (selectedVideo && studentData) {
      await learningService.updateVideoProgress(studentData.uid, selectedVideo.id, 100, true);
      toast.success('Leçon marquée comme terminée !');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedVideo || !studentData) return;

    setSubmittingComment(true);
    try {
      await learningService.addVideoComment({
        videoId: selectedVideo.id,
        userId: studentData.uid,
        userName: studentData.fullName,
        userRole: 'student',
        userPhoto: studentData.profileImageUrl || studentData.photoURL,
        content: newComment
      });
      setNewComment('');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getVideoProgress = (videoId: string) => progress.find(p => p.videoId === videoId);

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmbedUrl = (video: Video) => {
    if (video.videoType === 'youtube') {
      const id = video.videoUrl.split('v=')[1]?.split('&')[0] || video.videoUrl.split('/').pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    if (video.videoType === 'vimeo') {
      const id = video.videoUrl.split('/').pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    return video.videoUrl;
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accès à la plateforme...</p>
    </div>
  );

  if (selectedVideo) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setSelectedVideo(null)}
             className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
           >
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
              <h1 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">{selectedVideo.title}</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Film className="w-3 h-3" /> Cours en Vidéo
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
           <div className="xl:col-span-2 space-y-8">
              <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                 <iframe 
                   src={getEmbedUrl(selectedVideo)}
                   className="w-full h-full"
                   allowFullScreen
                   title={selectedVideo.title}
                 ></iframe>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">{selectedVideo.title}</h2>
                       <div className="flex items-center gap-6">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                            <User className="w-4 h-4 text-indigo-500" /> Prof. {selectedVideo.creatorName || 'Académie'}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                            <Clock className="w-4 h-4 text-amber-500" /> {selectedVideo.duration || 'Durée non définie'}
                          </span>
                       </div>
                    </div>
                    <button 
                      onClick={handleComplete}
                      disabled={getVideoProgress(selectedVideo.id)?.completed}
                      className={cn(
                        "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-3",
                        getVideoProgress(selectedVideo.id)?.completed 
                          ? "bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100" 
                          : "bg-[#0f172a] text-white hover:bg-slate-800 shadow-xl shadow-slate-200"
                      )}
                    >
                      {getVideoProgress(selectedVideo.id)?.completed ? (
                        <><CheckCircle2 className="w-4 h-4" /> Terminé</>
                      ) : 'Marquer comme vu'}
                    </button>
                 </div>

                 <p className="text-slate-600 leading-relaxed text-sm italic border-l-4 border-indigo-500 pl-6 py-2">
                    {selectedVideo.description || "Aucun résumé disponible pour ce cours."}
                 </p>
              </div>

              {/* Mobile Comments Section */}
              <div className="xl:hidden bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                 <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                   <MessageSquare className="w-5 h-5 text-indigo-500" /> Discussion ({comments.length})
                 </h3>
                 {/* ... comment rendering repeated below for desktop layout ... */}
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[600px] flex flex-col">
                 <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8 shrink-0">
                   <MessageSquare className="w-5 h-5 text-indigo-500" /> Discussion ({comments.length})
                 </h3>

                 <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                    {comments.map((c, i) => (
                      <div key={c.id} className="flex gap-4">
                         <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 font-black text-xs">
                            {c.userName.substring(0, 2).toUpperCase()}
                         </div>
                         <div className="space-y-1">
                            <div className="flex items-center gap-2">
                               <p className="text-[10px] font-black uppercase tracking-tight">{c.userName}</p>
                               <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                 c.userRole === 'professor' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                               }`}>
                                 {c.userRole}
                               </span>
                            </div>
                            <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-2xl rounded-tl-none leading-relaxed px-4">{c.content}</p>
                         </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center py-12 space-y-3">
                         <MessageSquare className="w-10 h-10 text-slate-100 mx-auto" />
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">Soyez le premier à commenter</p>
                      </div>
                    )}
                 </div>

                 <form onSubmit={handleComment} className="mt-8 pt-8 border-t border-slate-50 shrink-0">
                    <div className="relative">
                       <input 
                         type="text" 
                         value={newComment}
                         onChange={e => setNewComment(e.target.value)}
                         placeholder="Votre question ou remarque..."
                         className="w-full p-5 pr-14 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                       />
                       <button 
                         type="submit"
                         disabled={submittingComment || !newComment.trim()}
                         className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[#0f172a] text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                       >
                         {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase underline decoration-indigo-500 decoration-8 underline-offset-4">Centre d'Apprentissage Vidéo</h1>
          <p className="text-slate-500 mt-4 uppercase text-[10px] font-black tracking-[0.3em] flex items-center gap-3">
            <Film className="w-4 h-4 text-indigo-500" /> {studentData?.department} • Explorez vos cours en format dynamique
          </p>
        </div>
        
        <div className="relative group w-full md:w-80 z-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une leçon..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-slate-50 border border-slate-200 pl-14 pr-6 py-5 rounded-[2rem] text-sm w-full outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-300 shadow-inner"
          />
        </div>

        <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence>
          {filteredVideos.map((video, i) => {
            const prog = getVideoProgress(video.id);
            return (
              <motion.div 
                layout
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative"
              >
                 <div className="aspect-video bg-slate-900 relative">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <Film className="w-16 h-16" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                       <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 scale-75 group-hover:scale-100 transition-transform duration-500">
                          <Play className="w-8 h-8 fill-current" />
                       </div>
                    </div>
                    
                    {prog?.completed && (
                       <div className="absolute top-4 right-4 px-4 py-2 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 animate-bounce">
                          <CheckCircle2 className="w-3 h-3" /> Terminé
                       </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4">
                       <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden blur-[0.5px]">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-1000" 
                            style={{ width: `${prog?.progress || 0}%` }}
                          ></div>
                       </div>
                    </div>
                 </div>

                 <div className="p-10 flex-1 flex flex-col space-y-6">
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-slate-900 line-clamp-2 italic uppercase tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">{video.title}</h3>
                       <div className="flex items-center gap-4">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                            <Clock className="w-3.5 h-3.5 text-amber-500" /> {video.duration || '00:00'}
                          </span>
                       </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic flex-1">
                      {video.description || "Plongez dans cette leçon immersive conçue par vos experts académiques."}
                    </p>
                    
                    <button 
                      onClick={() => handleVideoSelect(video)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 group-hover:shadow-indigo-200"
                    >
                       Suivre le cours <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                 </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredVideos.length === 0 && (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-100">
              <Film className="w-12 h-12" />
            </div>
            <div className="space-y-1">
               <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 italic">🎬 Le silence est d'or</p>
               <p className="text-[9px] font-bold text-slate-200 uppercase">Aucun cours vidéo disponible pour votre département</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
