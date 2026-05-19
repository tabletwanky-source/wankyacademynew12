import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Loader2, 
  MessageSquare, 
  Send,
  User,
  Clock,
  Film,
  Download,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { learningService } from '../../services/learningService';
import { Video, VideoProgress, VideoComment } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function VideoLessonPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const { studentData } = useAuth();
  const navigate = useNavigate();
  
  const [video, setVideo] = useState<Video | null>(null);
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId || !studentData) return;

    const loadData = async () => {
      try {
        const v = await learningService.getVideo(videoId);
        if (v) {
          setVideo(v);
          // Mark as started if not already
          await learningService.updateVideoProgress(studentData.uid, v.id, 0, false);
        } else {
          toast.error('Video non trouvée');
          navigate('/dashboard/learning');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const unsubProgress = learningService.subscribeVideoProgress(studentData.uid, (data) => {
      const p = data.find(item => item.videoId === videoId);
      setProgress(p || null);
    });

    const unsubComments = learningService.subscribeVideoComments(videoId, (data) => {
      setComments(data);
    });

    return () => {
      unsubProgress();
      unsubComments();
    };
  }, [videoId, studentData]);

  const handleComplete = async () => {
    if (video && studentData) {
      await learningService.updateVideoProgress(studentData.uid, video.id, 100, true);
      toast.success('Leçon marquée comme terminée !');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !video || !studentData) return;

    setSubmittingComment(true);
    try {
      await learningService.addVideoComment({
        videoId: video.id,
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

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Chargement du cours...</p>
    </div>
  );

  if (!video) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
         <button 
           onClick={() => navigate(-1)}
           className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
         >
           <ArrowLeft className="w-5 h-5" />
         </button>
         <div>
            <h1 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">{video.title}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Film className="w-3 h-3 text-indigo-500" /> {video.department} • Module Vidéo
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
         <div className="xl:col-span-2 space-y-8">
            <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group border border-slate-800">
               <iframe 
                 src={learningService.getEmbedUrl(video)}
                 className="w-full h-full"
                 allowFullScreen
                 title={video.title}
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               ></iframe>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
               <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-2">
                     <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">{video.title}</h2>
                     <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                          <User className="w-4 h-4 text-indigo-500" /> Prof. {video.creatorName || 'Académie'}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                          <Clock className="w-4 h-4 text-amber-500" /> {video.duration || '00:00'}
                        </span>
                     </div>
                  </div>
                  <button 
                    onClick={handleComplete}
                    disabled={progress?.completed}
                    className={cn(
                      "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-3",
                      progress?.completed 
                        ? "bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100" 
                        : "bg-[#0f172a] text-white hover:bg-slate-800 shadow-xl shadow-slate-200"
                    )}
                  >
                    {progress?.completed ? (
                      <><CheckCircle2 className="w-4 h-4" /> Leçon Terminée</>
                    ) : 'Marquer comme vu'}
                  </button>
               </div>

               <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Description du cours</h4>
                 <p className="text-slate-600 leading-relaxed text-sm italic border-l-4 border-indigo-500 pl-6 py-2 bg-slate-50/50 rounded-r-xl">
                    {video.description || "Aucun résumé disponible pour ce cours."}
                 </p>
               </div>
               
               {video.url && video.url.includes('drive.google.com') && (
                 <div className="pt-8 border-t border-slate-50">
                   <a 
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic"
                   >
                     <Download className="w-4 h-4" /> Télécharger les ressources
                   </a>
                 </div>
               )}
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[700px] flex flex-col">
               <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8 shrink-0">
                 <MessageSquare className="w-5 h-5 text-indigo-500" /> Discussion ({comments.length})
               </h3>

               <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                  {comments.map((c, i) => (
                    <div key={c.id} className="flex gap-4">
                       <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 font-black text-xs">
                          {c.userName.substring(0, 2).toUpperCase()}
                       </div>
                       <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                             <p className="text-[10px] font-black uppercase tracking-tight">{c.userName}</p>
                             <span className={cn(
                               "text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                               c.userRole === 'professor' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                             )}>
                               {c.userRole}
                             </span>
                          </div>
                          <p className="text-xs text-slate-600 italic bg-slate-50 p-4 rounded-2xl rounded-tl-none leading-relaxed">{c.content}</p>
                       </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-20 space-y-3">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-slate-200" />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Aucune question pour le moment</p>
                    </div>
                  )}
               </div>

               <form onSubmit={handleComment} className="mt-8 pt-8 border-t border-slate-100 shrink-0">
                  <div className="relative">
                     <input 
                       type="text" 
                       value={newComment}
                       onChange={e => setNewComment(e.target.value)}
                       placeholder="Posez votre question..."
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
